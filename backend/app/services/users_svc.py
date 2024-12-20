"""This module contains the service methods for the users."""

from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.models import CS_Users


def get_user_by_username(db: Session, username: str) -> CS_Users:
    """Method to get a user by their username."""
    return db.query(CS_Users).filter(CS_Users.username == username).first()

def get_user_id(name_or_email: str, db: Session) -> int:
    """
    Retrieve the user ID based on the provided username or email.

    Args:
        name_or_email (str): The username or email of the user.
        db (Session): The database session to use for querying.

    Returns:
        int: The ID of the user if found, otherwise None.
    """
    if user := (
        db.query(CS_Users)
        .filter(
            or_(
                CS_Users.email == name_or_email,
                CS_Users.username == name_or_email,
            )
        )
        .first()
    ):
        return user.id
    return None

def is_user_valid(db: Session, user_id: int) -> bool:
    """Method to check if a user is valid."""
    return db.query(CS_Users).filter(CS_Users.id == user_id).first() is not None
