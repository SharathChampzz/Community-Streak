# app/auth.py
import os
import logging
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from jwt import ExpiredSignatureError, InvalidTokenError
from app.models import CS_Users

logger = logging.getLogger("auth")

SECRET_KEY = os.getenv("SECRET_KEY")
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15  # minutes
REFRESH_ACCESS_TOKEN_EXPIRE_DAYS = 7  # days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/users/login")


# Function to decode the JWT token and get the user data
def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    """
    Retrieve the current user based on the provided JWT token.

    Args:
        token (str): The JWT token provided by the user. Defaults to the token from the OAuth2 scheme.

    Returns:
        str: The username extracted from the token.

    Raises:
        HTTPException: If the token is invalid, expired, or if there is an error during decoding.
    """
    try:
        # payload = decode_access_token(token, SECRET_KEY)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        logger.info("Decoded token for user %s", username)
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token is invalid",
            )
        return username  # Return the username instead of the token
    except ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        ) from exc
    except InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid!!",
        ) from exc
    except jwt.JWTError as err:
        logger.error("Error while decoding the token: %s", err)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Internal error Occured while decrypting the token",
        ) from err


def get_user_id(name_or_email: str, db: Session) -> int:
    """
    Retrieve the user ID based on the provided username or email.

    Args:
        name_or_email (str): The username or email of the user.
        db (Session): The database session to use for querying.

    Returns:
        int: The ID of the user if found, otherwise None.
    """
    user = (
        db.query(CS_Users)
        .filter(
            or_(CS_Users.email == name_or_email, CS_Users.username == name_or_email)
        )
        .first()
    )
    if user:
        return user.id
    return None


def verify_password(plain_password, hashed_password) -> bool:
    """
    Verify that a plain text password matches a hashed password.

    Args:
        plain_password (str): The plain text password to verify.
        hashed_password (str): The hashed password to compare against.

    Returns:
        bool: True if the plain password matches the hashed password, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def hash_password(password) -> str:
    """
    Hashes a given password using a predefined hashing context.

    Args:
        password (str): The plain text password to be hashed.

    Returns:
        str: The hashed password as a string.
    """
    return pwd_context.hash(password)


def create_access_token(
    data: dict,
    expires_delta: timedelta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
) -> str:
    """
    Create a JSON Web Token (JWT) for the given data with an expiration time.

    Args:
        data (dict): The data to encode in the JWT. Typically includes user information.
        expires_delta (timedelta, optional): The time duration after which the token will expire.
                                             Defaults to a timedelta of ACCESS_TOKEN_EXPIRE_MINUTES.

    Returns:
        str: The encoded JWT as a string.
    """
    logger.info("Creating access token for user %s", data.get("sub"))
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return encoded_jwt


def create_refresh_token(
    data: dict,
    expires_delta: timedelta = timedelta(days=REFRESH_ACCESS_TOKEN_EXPIRE_DAYS),
) -> str:
    """
    Creates a refresh token with the given data and expiration time.

    Args:
        data (dict): The data to encode in the token.
        expires_delta (timedelta, optional): The time duration after which the token will expire. Defaults to a timedelta of REFRESH_ACCESS_TOKEN_EXPIRE_DAYS days.

    Returns:
        str: The encoded JWT refresh token.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm="HS256")
    return encoded_jwt


def decode_access_token(token: str, secret_key: str) -> dict:
    """
    Decodes a JWT access token using the provided secret key.

    Args:
        token (str): The JWT access token to decode.
        secret_key (str): The secret key used to decode the token.

    Returns:
        dict: The decoded payload if the token is valid.
        None: If the token is invalid or decoding fails.
    """
    try:
        payload = jwt.decode(token, secret_key, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
