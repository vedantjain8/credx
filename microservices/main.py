import json
import logging
import os
import sys
import time
import traceback

import requests
from classifier.model_service import classify_text
from controller.db_controller import (close_connection, execute_query,
                                      make_connection)
from controller.gemini import create_gemini_client, generate_text
from dotenv import load_dotenv
from psycopg2 import Error as sqle
from scraper.scraper_mod import ScraperMod
from sentence_transformers import SentenceTransformer
from tag_extraction.get_tags import extract_tags

load_dotenv()

RETRY_DELAY = int(os.getenv("RETRY_DELAY", "60"))  # seconds


def delete_queue_item():
    delete_response = requests.delete(
        os.getenv("API_SERVER", "http://localhost:3000") + "/api/bloc/queue", timeout=30)
    if delete_response.status_code != 200:
        logging.error(
            f"Failed to delete queue item: {delete_response.status_code} {delete_response.text}")
    logging.info("Deleted processed queue item")


# new helper to validate queue message structure
def is_valid_queue_item(item):
    try:
        return bool(
            item.get("article_url")
            and item.get("budget") is not None
            and item.get("website_id")
            and item.get("promoter_id")
        )
    except AttributeError:
        return False


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
                    time.sleep(RETRY_DELAY)  # Wait before retrying
                    continue

                # Robust parsing of the queue response (handles dict, list, or JSON/string payloads)
                queue_data_raw = response.json()
                logging.debug("Raw queue response: %r", queue_data_raw)

                if not queue_data_raw:
                    logging.info(
                        "No articles in the queue. Retrying in 30 seconds...")
                    time.sleep(RETRY_DELAY)
                    continue

                if isinstance(queue_data_raw, str):
                    try:
                        queue_data = json.loads(queue_data_raw)
                    except json.JSONDecodeError:
                        # If it's just a plain string (e.g. a URL), wrap it
                        queue_data = {"message": queue_data_raw}
                elif isinstance(queue_data_raw, list):
                    queue_data = queue_data_raw[0] if queue_data_raw else {}
                elif isinstance(queue_data_raw, dict):
                    queue_data = queue_data_raw
                else:
                    queue_data = {}

                if not queue_data:
                    logging.info(
                        "No articles in the queue. Retrying in 30 seconds...")
                    time.sleep(RETRY_DELAY)
                    continue

                item = queue_data.get("message")
                logging.debug(
                    "Normalized queue message before parsing: %r", item)
                # If the message itself is a JSON string, parse it. If it's a simple string (e.g. URL), normalize it.
                if isinstance(item, str):
                    try:
                        item = json.loads(item)
                    except json.JSONDecodeError:
                        # If it's just a URL string, normalize to dict
                        if item.startswith("http://") or item.startswith("https://"):
                            item = {"article_url": item}
                        else:
                            # fallback: wrap into message field
                            item = {"message": item}
                if not isinstance(item, dict):
                    logging.error(
                        "Queue message has unexpected format. Skipping and deleting to avoid blocking. Message: %r", item)
                    delete_queue_item()
                    time.sleep(RETRY_DELAY)
                    continue

                # Validate required fields. If incomplete, skip without deleting so the producer can retry/fix it.
                if not is_valid_queue_item(item):
                    logging.warning(
                        "Incomplete queue message; skipping without deleting so it can be retried. Item: %r", item)
                    # short backoff to avoid spinning
                    time.sleep(15)
                    continue

                website_id = item.get("website_id")
                article_url = item.get("article_url")
                budget = item.get("budget")
                promoter_id = item.get("promoter_id")

                if not article_url or not budget or not website_id or not promoter_id:
                    logging.error(
                        "Invalid data in queue item. Deleting from queue...")
                    delete_queue_item()
                    time.sleep(RETRY_DELAY)
                    continue

                logging.info(f"Processing article: {article_url}")

                # Fetch website ID and verification token
                verification_token = execute_query(
                    cursor=cur,
                    query="""
                SELECT verification_token FROM public.websites WHERE website_id = %s
                """,
                    params=(str(website_id),),
                    fetch=True,
                )
                # Log raw result and its type for debugging
                logging.debug(
                    "Raw verification_token (db) for website_id=%s: %r", website_id, verification_token)
                print("verification_token is: ", verification_token,
                      "and website_id is: ", website_id)

                # If execute_query returned the error sentinel, treat as DB error
                if verification_token == 500:
                    logging.error(
                        "Database query failed when fetching verification token for website_id=%s", website_id)
                    delete_queue_item()
                    time.sleep(RETRY_DELAY)
                    continue
                if not verification_token:
                    logging.error("No verification token provided.")
                    delete_queue_item()
                    time.sleep(RETRY_DELAY)
                    continue
                # Normalize verification_token (handle list/tuple row structures)
                # Possible shapes: [('token',)], ['token'], ('token',), 'token'
                if isinstance(verification_token, (list, tuple)) and len(verification_token) > 0:
                    first = verification_token[0]
                    if isinstance(first, (list, tuple)) and len(first) > 0:
                        verification_token = first[0]
                    else:
                        verification_token = first
                # now verification_token should be a string
                if not isinstance(verification_token, str):
                    logging.error("Invalid verification token format.")
                    delete_queue_item()
                    time.sleep(RETRY_DELAY)
                    continue

                scraper = ScraperMod(article_url=article_url,
                                     verification_code=verification_token, promoter_id=promoter_id)

                soup = scraper.fetch_article_html()
                if not soup:
                    logging.error("Failed to fetch article HTML.")
                    delete_queue_item()
                    time.sleep(RETRY_DELAY)
                    continue

                # If allowed, scrape the article page for title, author, date, content
                if scraper.website_status(website_id=website_id, cursor=cur) and scraper.has_credx_verification(soup):
                    if not scraper.check_budget(entered_budget=budget, cursor=cur):
                        logging.warning(
                            "Insufficient budget. Skipping article.")
                        delete_queue_item()
                        time.sleep(RETRY_DELAY)
                        continue
                    content = scraper.scrape_and_clean_article(soup)
                    if not content:
                        logging.warning("Could not extract content.")
                        delete_queue_item()
                        time.sleep(RETRY_DELAY)
                        continue

                    title = content.strip().splitlines()[0]
                    title_image = scraper.get_title_image(soup)
                    category = classify_text(content)['label']
                    tags = extract_tags(
                        title=title, content=content, top_k=15)

                    prompt = f"""
                    Generate a very short blog post summary in 80 words or less from the below context, 
                    make sure it is super interesting such that it compels the user to click and read the full article. 
                    output should be in plain text only Context: {content}"""
                    summary = generate_text(
                        client=gemini_client, prompt=prompt, model="gemini-2.5-flash")

                    platform_fee = (budget * 5/100)
                    impressions = (budget - platform_fee) * 10
                    boost = 1.0

                    text = f"{title} {summary} {' '.join(tags)}"
                    emb = embedder.encode(
                        text, normalize_embeddings=True)
                    emb_list = emb.tolist()
                    emb_sql = "[" + ",".join([str(x)
                                              for x in emb_list]) + "]"

                    promotion_insertion_status = execute_query(cursor=cur, query="""
                        INSERT INTO promotions 
                            (title,
                            image_url,
                            summary, 
                            tags, 
                            categories,
                            article_url, 
                            budget,
                            remaining_impressions,
                            boost, 
                            embedding,
                            promoter_id,
                            status,
                            website_id
                            )
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s::vector, %s, %s, %s, %s)
                        RETURNING promotion_id
                    """, params=(title, title_image, summary, tags, category, article_url, budget, impressions,
                                 boost, emb_sql, promoter_id, "active", website_id), fetch=True)
                    # execute_query now returns a scalar for single-column fetches,
                    # a tuple/list for multi-column rows, None when no row, or 500 on error.
                    if promotion_insertion_status == 500 or promotion_insertion_status is None:
                        logging.error(
                            "Failed to insert promotion into the database. Raw result: %r", promotion_insertion_status)
                        delete_queue_item()
                        time.sleep(RETRY_DELAY)
                        continue

                    # Normalize to a scalar promotion_id regardless of shape
                    if isinstance(promotion_insertion_status, (list, tuple)):
                        promotion_id = promotion_insertion_status[0] if len(
                            promotion_insertion_status) > 0 else None
                    else:
                        promotion_id = promotion_insertion_status

                    if promotion_id is None:
                        logging.error(
                            "Failed to obtain promotion_id after insert. Raw result: %r", promotion_insertion_status)
                        delete_queue_item()
                        time.sleep(RETRY_DELAY)
                        continue

                    logging.debug("Inserted promotion_id=%r", promotion_id)

                    # update the promoter wallet balance
                    promoter_wallet_update = execute_query(cursor=cur, query="""
                        UPDATE wallets
                        SET balance = balance - %s
                        WHERE user_id = %s
                        returning wallet_id
                    """, params=(budget, promoter_id), fetch=True)
                    if promoter_wallet_update == 500:
                        logging.error(
                            "Failed to update promoter wallet for user_id=%s", promoter_id)
                    logging.debug("Promoter wallet update result: %r",
                                  promoter_wallet_update)

                    # take the platform fee and update admin wallet
                    platform_fee_status = execute_query(cursor=cur, query="""
                        UPDATE wallets
                        SET balance = balance + %s
                        WHERE user_id = %s
                    """, params=(budget, "a1b2c3d4-e5f6-5432-1098-76543210abcd"), fetch=False)
                    if platform_fee_status == 500:
                        logging.error(
                            "Failed to update admin wallet with platform fee of credit = %s.", platform_fee)

                    # add transaction log entry for platform fee
                    transaction_log_status = execute_query(cursor=cur, query=""" 
                    INSERT INTO transactions (from_wallet_id, to_wallet_id, amount, transaction_type) 
                    VALUES ( %s, %s, %s, %s )
                    """, params=(promoter_wallet_update,
                                 "a1b2c3d4-e5f6-5432-1098-76543210abcd",
                                 platform_fee, "platform_fee"),
                        fetch=False)
                    if transaction_log_status == 500:
                        logging.error(
                            "Failed to log transaction for platform fee of credit = %s.", platform_fee)

                    logging.info(
                        "Successfully processed and stored article")
                    db_connection.commit()
                    logging.info("Database changes committed.")
                    delete_queue_item()
                else:
                    logging.info("Skipping unverified article")
                    delete_queue_item()

            except sqle as sqlee:
                logging.error(f"Database error: {sqlee}")
                delete_queue_item()
            except json.JSONDecodeError as jde:
                logging.error(f"JSON decode error: {jde}")
                delete_queue_item()
            except requests.RequestException as re:
                logging.error(f"Request error: {re}")
                delete_queue_item()
            except Exception as e:
                print("\n--- Detailed Error Traceback ---")
                traceback.print_exc(file=sys.stdout)
                print("------------------------------\n")
                logging.error(f"An error occurred during processing: {e}")
                delete_queue_item()

            # Wait for 30 seconds before checking the queue again
            time.sleep(RETRY_DELAY)

    except Exception as e:
        logging.critical(f"An unexpected error occurred: {e}")
    except KeyboardInterrupt:
        logging.info("Execution interrupted by user.")
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
