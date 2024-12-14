"""
User Routes Module
This module defines the routes related to user operations such as signup, login, fetching user details, and refreshing tokens.
It uses FastAPI for creating the API endpoints and SQLAlchemy for database interactions.
Routes:
    - POST /signup: Register a new user.
    - POST /login: Authenticate a user and return access and refresh tokens.
    - GET /users: Retrieve a list of all users.
    - GET /users/{user_id}: Retrieve details of a specific user by user ID.
    - GET /me: Retrieve details of the currently logged-in user.
    - GET /users/{user_id}/events: Retrieve events joined by a specific user.
    - POST /token/refresh: Refresh the access token using a refresh token.
Dependencies:
    - FastAPI
    - SQLAlchemy
    - app.database
    - app.models
    - app.schemas
    - app.auth

"""
# app/routes/user_routes.py
import logging
import os
import base64
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db
from app.models import CS_Users, CS_UserEvents, CS_Events
from app.schemas import UserCreate, Token
from app.auth import hash_password, verify_password, create_access_token, create_refresh_token, get_current_user, decode_access_token

router = APIRouter()

logger = logging.getLogger(__name__)

REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY")


@router.post("/signup", response_model=dict)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    """Signup route to register a new user"""
    existing_user = db.query(CS_Users).filter(
        CS_Users.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    hashed_password = hash_password(user.password)
    new_user = CS_Users(
        username=user.username,
        email=user.email,
        password_hash=hashed_password,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    logger.info("User %s registered successfully", new_user.username)
    return {"message": "User registered successfully"}


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login route to authenticate a user and return access and refresh tokens"""
    db_user = db.query(CS_Users).filter(
        or_(CS_Users.email == form_data.username,
            CS_Users.username == form_data.username)
    ).first()
    decoded_base64_password = base64.b64decode(
        form_data.password).decode("utf-8")

    if not db_user or not verify_password(decoded_base64_password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    access_token = create_access_token(data={"sub": db_user.email})
    refresh_token = create_refresh_token(data={"sub": db_user.email})
    logger.info("User %s logged in successfully", db_user.username)
    return {"access_token": access_token, "token_type": "bearer", "refresh_token": refresh_token}


@router.get("/users", response_model=list[dict])
def get_all_users(db: Session = Depends(get_db)):
    """Route to fetch all users"""
    users = db.query(CS_Users).all()
    return [{"id": user.id, "username": user.username, "email": user.email, "flags": user.flags} for user in users]


@router.get("/users/{user_id}", response_model=dict)
def get_user_details(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Route to fetch details of a specific user by user ID"""
    # Fetch user details
    user = db.query(CS_Users).filter(CS_Users.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch all joined events and streaks
    user_events = (
        db.query(CS_UserEvents)
        .filter(CS_UserEvents.user_id == user_id)
        .join(CS_Events, CS_Events.id == CS_UserEvents.event_id)
        .all()
    )
    events = [
        {
            "event_id": ue.event_id,
            "event_name": ue.event.name,
            "streak_count": ue.streak_count,
            "is_private": ue.event.is_private,
            "flags": ue.event.flags,
        }
        for ue in user_events
    ]

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,  # You can exclude email if privacy is needed
        "flags": user.flags,
        "created_at": user.created_at,
        "joined_events": events,
    }


# currently logged in user details
@router.get("/me", response_model=dict)
def get_me(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Route to fetch details of the currently logged-in user"""
    # Fetch user details
    logger.info('Fetching user details for %s', current_user)
    user = db.query(CS_Users).filter(
        or_(CS_Users.email == current_user, CS_Users.username == current_user)
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch all joined events and streaks
    user_events = (
        db.query(CS_UserEvents)
        .filter(CS_UserEvents.user_id == 1)
        .join(CS_Events, CS_Events.id == CS_UserEvents.event_id)
        .all()
    )
    events = [
        {
            "id": ue.event_id,
            "name": ue.event.name,
            "streak_count": ue.streak_count,
            "is_private": ue.event.is_private,
            "flags": ue.event.flags,
        }
        for ue in user_events
    ]

    response = {
        "id": user.id,
        "username": user.username,
        "email": user.email,  # You can exclude email if privacy is needed
        "flags": user.flags,
        "created_at": user.created_at,
        "joined_events": events,
    }
    logger.info('User details fetched successfully for %s - %s',
                current_user, response)
    return response


@router.get("/users/{user_id}/events", response_model=list[dict])
def get_user_events(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Route to fetch events joined by a specific user"""
    user_events = (
        db.query(CS_UserEvents)
        .filter(CS_UserEvents.user_id == user_id)
        .join(CS_Events, CS_Events.id == CS_UserEvents.event_id)
        .all()
    )
    events = [
        {
            "id": ue.event_id,
            "name": ue.event.name,
            "description": ue.event.description,
            "created_by": ue.event.created_by,
            "is_private": ue.event.is_private,
            "flags": ue.event.flags,
            "streak_count": ue.streak_count,
            # check if last modified is today
            "completed":  ue.modified.date() == datetime.now(timezone.utc).date() if ue.modified else False,
        }
        for ue in user_events
    ]
    return events


@router.post("/token/refresh", response_model=Token)
def refresh_access_token(
    refresh_token: str
):
    """Route to refresh the access token using a refresh token"""
    payload = decode_access_token(refresh_token, REFRESH_SECRET_KEY)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    username: str = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    access_token = create_access_token(data={"sub": username})
    return {"access_token": access_token, "token_type": "bearer", "refresh_token": refresh_token}
