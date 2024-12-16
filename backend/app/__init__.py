"""
This file is used to load environment variables from .env file.
"""

import os
import logging
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

# print current working directory
print(f'Current working directory: {os.getcwd()}')

SECRET_KEY = os.getenv("SECRET_KEY")
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY")

print(f'Fetching SECRET: {SECRET_KEY}')
print(f'Fetching REFRESH_SECRET: {REFRESH_SECRET_KEY}')

# Configure logging
logging.basicConfig(
    level=int(os.getenv("DEBUG_LEVEL", str(logging.DEBUG))),  # Minimum log level for the application
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),  # Logs to console
        logging.FileHandler("app.log"),  # Logs to a file
    ],
)

