"""
    This file contains the database connection and session creation logic.
"""

# app/database.py
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise EnvironmentError("DB connection string not set in environment")
else:
    print(f"Using database URL: {DATABASE_URL}")

engine = create_engine(
    DATABASE_URL,
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
