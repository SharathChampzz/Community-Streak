"""
    This file contains the database connection and session creation logic.
"""

# app/database.py
import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

logger = logging.getLogger(__name__)
logger.info("Database URL: [%s]", settings.database_url)

if not settings.database_url:
    raise EnvironmentError("DB connection string not set in environment")

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
    pool_size=5,  # Maintain up to 5 connections
    max_overflow=10,  # Allow up to 10 connections to be created at once
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Method to get a database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
