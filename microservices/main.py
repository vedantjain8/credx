from sentence_transformers import SentenceTransformer
import os
import logging
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
            embedder = SentenceTransformer(EMBED_MODEL)
            embedder.save(LOCAL_MODEL_PATH)

        embedder = SentenceTransformer(EMBED_MODEL)

        while True:
            try:
                # Fetch articles from the queue API
                response = requests.get(
                    (os.getenv("API_SERVER", "http://localhost:3000")) + "/api/bloc/queue")
                if response.status_code != 200:
                    logging.error(f"Failed to fetch queue: {response.text}")
                    time.sleep(30)
                    continue

                queue_data = response.json()
                print(queue_data)
                if not queue_data:
                    logging.info(
                        "No articles in the queue. Retrying in 30 seconds...")
                    time.sleep(30)
                    continue

                item = queue_data.get("message")
                website_id = item.get("website_id")
                article_url = item.get("article_url")
                budget = item.get("budget")

                if not article_url or not budget:
                    logging.error(
                        "Invalid data in queue item. Skipping...")
                    continue

                logging.info(f"Processing article: {article_url}")

                # Fetch website ID and verification token
                verification_token = execute_query(cursor=cur, query="""
                select website_id, verification_token from websites where website_id = %s
                """, params=(website_id,), fetch=True)

                scraper = ScraperMod(article_url=article_url,
                                     verification_code=verification_token)

                soup = scraper.fetch_article_html()

                # If allowed, scrape the article page for title, author, date, content
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

                        if not website_id:
                            logging.error(
                                "Invalid verification code provided.")
                            continue
                        website_id = website_id[0]

                        prompt = f"""
                        Generate a very short blog post summary in 80 words or less from the below context, 
                        make sure it is super interesting such that it compels the user to click and read the full article. 
                        output should be in plain text only Context: {content}"""
                        description = generate_text(
                            client=gemini_client, prompt=prompt, model="gemini-2.5-flash")

                        query = """
                            INSERT INTO content_items (
                                website_id, title, original_url, description, s3_path, image_url, category, tags, status
                            ) VALUES (
                                %s, %s, %s, %s, %s, %s, %s, %s, %s
                            ) returning content_id;
                        """
                        params = (
                            website_id,
                            title,
                            article_url,
                            description,
                            filename,
                            title_image,
                            category,
                            tags,
                            'active'
                        )
                        query_status = execute_query(
                            cursor=cur, query=query, params=params)
                        if query_status != 200:
                            logging.error(
                                "Failed to insert article metadata")
                            continue

                        article_id = cur.fetchone()[0]
                        logging.info(
                            f"Inserted article with ID: {article_id}")

                        impressions = 0
                        boost = 1.0

                        text = f"{title} {description} {' '.join(tags)}"
                        emb = embedder.encode(
                            text, normalize_embeddings=True)
                        emb_list = emb.tolist()
                        emb_sql = "[" + ",".join([str(x)
                                                  for x in emb_list]) + "]"

                        status = execute_query(cursor=cur, query="""
                            INSERT INTO promotions 
                                (article_id, 
                                title,
                                summary, 
                                tags, 
                                categories, 
                                budget,
                                boost, 
                                embedding,
                                remaining_impressions,
                                active)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s::vector, %s, %s)
                        """, params=(article_id, title, description, tags, category, budget, boost, emb_sql, impressions, True))
                        if status != 200:
                            logging.error(
                                "Failed to insert vector embedding into the database.")

                        logging.info(
                            "Successfully processed and stored article")
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

            except Exception as e:
                logging.error(f"An error occurred during processing: {e}")

            # Wait for 30 seconds before checking the queue again
            time.sleep(30)

    except Exception as e:
        logging.error(f"An unexpected error occurred: {e}")
    finally:
        if db_connection:
            close_connection(db_connection)
        if gemini_client:
            logging.info("Closing Gemini client connection.")


if __name__ == "__main__":

    # Configure logging for better debugging and monitoring
    logging.basicConfig(level=logging.INFO,
                        format='%(asctime)s - %(levelname)s - %(message)s')

    main()
