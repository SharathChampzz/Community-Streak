"""
This module provides authentication-related functionalities for the application, including
password hashing, JWT token creation and validation, and user retrieval based on tokens.
Functions:
    get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    verify_password(plain_password, hashed_password) -> bool:
    hash_password(password) -> str:
    create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=access_token_expire_minutes)) -> str:
    create_refresh_token(data: dict, expires_delta: timedelta = timedelta(days=refresh_access_token_expire_days)) -> str:
    decode_access_token(token: str) -> dict:
"""

import logging
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from jwt import ExpiredSignatureError, InvalidTokenError
from app.core.config import settings

logger = logging.getLogger("auth")

# Create a password hashing context
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
        # payload = decode_access_token(token, settings.secret_key)
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
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
    expires_delta: timedelta = timedelta(minutes=settings.access_token_expire_minutes),
) -> str:
    """
    Create a JSON Web Token (JWT) for the given data with an expiration time.

    Args:
        data (dict): The data to encode in the JWT. Typically includes user information.
        expires_delta (timedelta, optional): The time duration after which the token will expire.

    Returns:
        str: The encoded JWT as a string.
    """
    logger.info("Creating access token for user %s", data.get("sub"))
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta

    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def create_refresh_token(
    data: dict,
    expires_delta: timedelta = timedelta(
        days=settings.refresh_access_token_expire_days
    ),
) -> str:
    """
    Creates a refresh token with the given data and expiration time.

    Args:
        data (dict): The data to encode in the token.
        expires_delta (timedelta, optional): The time duration after which the token will expire. Defaults to a timedelta of settings.refresh_access_token_expire_days days.

    Returns:
        str: The encoded JWT refresh token.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta

    to_encode["exp"] = expire
    return jwt.encode(
        to_encode, settings.token_refresh_key, algorithm=settings.algorithm
    )


def decode_access_token(token: str) -> dict:
    """
    Decodes a JWT access token using the provided secret key.

    Args:
        token (str): The JWT access token to decode.

    Returns:
        dict: The decoded payload if the token is valid.
        None: If the token is invalid or decoding fails.
    """
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None
