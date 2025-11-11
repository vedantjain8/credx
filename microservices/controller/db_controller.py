import logging
import os

from dotenv import load_dotenv
from psycopg2 import connect

# Load environment variables from .env
load_dotenv()

# Fetch variables
USER = os.getenv("DB_USER")
PASSWORD = os.getenv("DB_PASSWORD")
HOST = os.getenv("DB_HOST")
PORT = os.getenv("DB_PORT")
DBNAME = os.getenv("DB_NAME")

logger = logging.getLogger(__name__)


def make_connection():
    """
    Connect to the PostgreSQL database using credentials from environment variables.
    Returns the connection object if successful, else raises an exception.
    """
    # Connect to the database
    try:
        connection = connect(
            user=USER,
            password=PASSWORD,
            host=HOST,
            port=PORT,
            dbname=DBNAME
        )
        logger.info("Connection successful!")
        return connection
    except Exception as e:
        logger.error(f"Failed to connect: {e}")
        return None


def close_connection(connection):
    """
    Close the given database connection.
    """
    if connection:
        connection.close()
        logger.info("Connection closed.")


def execute_query(cursor, query, params=None, fetch=False):
    """
    Execute a SQL query using the provided cursor.

    Behavior:
    - If fetch is False: executes the query and returns 200 on success or 500 on failure.
    - If fetch is True: executes the query and returns:
        - None if no rows were found
        - a scalar value if the row contains a single column
        - a tuple for multi-column rows

    This makes it convenient for callers that expect a single column (e.g. verification_token)
    to receive the raw value directly.

    Args:
        cursor: psycopg2 cursor
        query: SQL query string
        params: optional parameters tuple/dict
        fetch: whether to fetch a single row

    Returns:
        int|None|tuple|Any: 200/500 for non-fetch calls; for fetch calls returns row or scalar or None.
    """
    try:
        # Always call execute with params if provided (None is acceptable)
        if params is not None:
            logger.debug("Executing query: %s params=%r", query, params)
            cursor.execute(query, params)
        else:
            logger.debug("Executing query: %s (no params)", query)
            cursor.execute(query)

        if fetch:
            row = cursor.fetchone()
            logger.debug("Fetched row: %r", row)
            if row is None:
                return None
            # If the row has exactly one column, return the scalar for convenience
            if isinstance(row, (list, tuple)) and len(row) == 1:
                return row[0]
            return row

    except Exception as e:
        logger.error(f"Query execution failed: {e}")
        return 500

    else:
        logger.info("Query executed successfully!")
        return 200
