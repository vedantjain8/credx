from sentence_transformers import SentenceTransformer
import os
import logging
import json  # <-- Import JSON for parsing
from classifier.model_service import classify_text
from tag_extraction.get_tags import extract_tags
from controller.db_controller import make_connection, close_connection, execute_query
from controller.gemini import create_gemini_client, generate_text
from dotenv import load_dotenv
from scraper.scraper_mod import ScraperMod
import time
import requests

load_dotenv()


def main():
    """
    Main execution function.
    """
    db_connection = None
    gemini_client = None
    try:
        # Initialize persistent connections
        db_connection = make_connection()
        gemini_client = create_gemini_client()
        cur = db_connection.cursor()

        EMBED_MODEL = "sentence-t5-base"
        LOCAL_MODEL_PATH = "./sentence-t5-base-local"

        if not os.path.exists(LOCAL_MODEL_PATH):
            logging.info(f"Downloading and saving model: {EMBED_MODEL}")
            embedder = SentenceTransformer(EMBED_MODEL)
            embedder.save(LOCAL_MODEL_PATH)

        embedder = SentenceTransformer(EMBED_MODEL)
        logging.info(f"Loaded embedding model: {EMBED_MODEL}")

        logging.info("--- Microservice started. Waiting for jobs... ---")

        while True:
            try:
                # Fetch articles from the queue API
                response = requests.get(
                    (os.getenv("API_SERVER", "http://localhost:3000")) + "/api/bloc/queue")

                if response.status_code != 200:
                    logging.error(f"Failed to fetch queue: {response.text}")

                else:
                    # --- START OF REFACTORED LOGIC ---
                    queue_data = response.json()
                    item_raw = queue_data.get("message")

                    # 1. CHECK IF QUEUE IS EMPTY OR MESSAGE IS MALFORMED
                    # This catches:
                    # - An empty response (if not queue_data)
                    # - A missing 'message' key (if not item_raw)
                    # - A 'message' that is a string like "Queue is empty" (not a dict)
                    
                    if not queue_data or not item_raw or not isinstance(item_raw, dict):
                        logging.info(
                            "No articles in the queue. Retrying in 30 seconds...")
                    
                    # 2. IF QUEUE IS NOT EMPTY, PROCESS THE JOB
                    else:
                        item = item_raw  # We know it's a valid dict
                        website_id = item.get("website_id")
                        article_url = item.get("article_url")
                        budget = item.get("budget")

                        # 3. CHECK FOR MISSING FIELDS
                        if not article_url or not budget or not website_id:
                            logging.error(
                                f"Invalid data in queue item (missing fields). Deleting. Data: {item}")
                            
                            # CRITICAL: Delete this bad job
                            deleteResponse = requests.delete(
                                os.getenv("API_SERVER", "http://localhost:3000") + "/api/bloc/queue")
                            if deleteResponse.status_code == 200:
                                logging.info("Deleted queue item with missing fields.")
                            else:
                                logging.error(f"Failed to delete queue item with missing fields: {deleteResponse.text}")
                        
                        # 4. ALL CHECKS PASSED. PROCESS THE VALID JOB
                        else:
                            logging.info(f"Processing article: {article_url}")

                            # Fetch website ID and verification token
                            website_data = execute_query(cursor=cur, query="""
                            select website_id, verification_token from websites where website_id = %s
                            """, params=(website_id,), fetch=True)

                            if not website_data:
                                logging.error(f"Website ID {website_id} not found. Skipping.")
                                # NOTE: You might want to delete this job from the queue too
                            else:
                                verification_token = website_data[0][1]

                                scraper = ScraperMod(article_url=article_url,
                                                     verification_code=verification_token)

                                soup = scraper.fetch_article_html()

                                # If allowed, scrape the article page
                                if scraper.has_credx_verification(soup):
                                    content = scraper.scrape_and_clean_article(soup)
                                    if content:
                                        unique_id = scraper.generate_unique_identifier()
                                        filename = f"{unique_id}.txt"
                                        scraper.upload_to_s3(content=content,
                                                             bucket="credx", object_name=filename)
                                        logging.info(f"Uploaded: {filename}")

                                        title = content.strip().splitlines()[0]
                                        title_image = scraper.get_title_image(soup)
                                        category = classify_text(content)['label']
                                        tags = extract_tags(
                                            title="", content=content, top_k=15)

                                        prompt = f"""
                                        Generate a very short blog post summary in 80 words or less from the below context, 
                                        make sure it is super interesting such that it compels the user to click and read the full article. 
                                        output should be in plain text only Context: {content}"""
                                        description = generate_text(
                                            client=gemini_client, prompt=prompt, model="gemini-2.5-flash")

                                        impressions = 0
                                        boost = 1.0

                                        text = f"{title} {description} {' '.join(tags)}"
                                        emb = embedder.encode(
                                            text, normalize_embeddings=True)
                                        emb_list = emb.tolist()
                                        emb_sql = "[" + ",".join([str(x)
                                                                for x in emb_list]) + "]"

                                        query = """
                                            INSERT INTO promotions (
                                                website_id, title, summary, tags, categories, budget, 
                                                s3_path, image_url, status, boost, embedding, remaining_impressions
                                            ) VALUES (
                                                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::vector, %s
                                            ) returning promotion_id;
                                        """
                                        params = (
                                            website_id, title, description, tags, category, budget,
                                            filename, title_image, 'pending', boost, emb_sql, impressions
                                        )

                                        query_status = execute_query(
                                            cursor=cur, query=query, params=params)

                                        if query_status != 200:
                                            logging.error("Failed to insert promotion metadata and embedding.")
                                        else:
                                            promotion_id = cur.fetchone()[0]
                                            logging.info(
                                                f"SUCCESS! New Promotion ID: {promotion_id} inserted.")

                                            # COMMIT INSIDE THE LOOP
                                            db_connection.commit()
                                            logging.info(
                                                f"Committed promotion ID {promotion_id} to database.")

                                            # Delete job from queue *after* successful commit
                                            deleteResponse = requests.delete(
                                                os.getenv("API_SERVER", "http://localhost:3000") + "/api/bloc/queue")
                                            if deleteResponse.status_code != 200:
                                                logging.error(
                                                    f"Failed to delete queue item: {deleteResponse.text}")
                                            logging.info("Deleted processed queue item")
                                    else:
                                        logging.warning("Could not extract content")
                                else:
                                    logging.info("Skipping unverified article")

                    # --- END OF REFACTORED LOGIC ---

            except json.JSONDecodeError as e:
                # Catches errors if the API response itself is not valid JSON
                logging.error(f"Failed to parse API response: {response.text}")
            except requests.RequestException as e:
                # Catches network errors (e.g., API server is down)
                logging.error(f"Network error while fetching queue: {e}")
            except Exception as e:
                # This catches any other unexpected error during a job's processing
                logging.error(
                    f"An error occurred during processing: {e}", exc_info=True)

            # Wait for 30 seconds before checking the queue again
            # This is now reached on EVERY loop iteration, fixing the bug.
            time.sleep(30)

    except Exception as e:
        # This catches critical startup errors (e.g., DB connection failed)
        logging.critical(
            f"A CRITICAL unexpected error occurred: {e}", exc_info=True)
    finally:
        # Cleanup
        if db_connection:
            # Commit is no longer here
            close_connection(db_connection)
            logging.info("Closed database connection.")
        if gemini_client:
            logging.info("Closing Gemini client connection.")


if __name__ == "__main__":

    # Configure logging for better debugging and monitoring
    logging.basicConfig(level=logging.INFO,
                        format='%(asctime)s - %(levelname)s - %(message)s')

    main()