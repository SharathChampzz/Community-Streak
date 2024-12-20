"""
This module defines the API routes for managing events in the Community Streak application.
It includes endpoints for creating events, retrieving events, joining and exiting events, 
and marking events as completed.
Routes:
    - POST /: Create a new event.
    - GET /: Retrieve a list of events.
    - GET /myevents: Retrieve a list of events created by the current user.
    - GET /joinedevents: Retrieve a list of events joined by the current user.
    - GET /{event_id}: Retrieve details of a specific event.
    - POST /{event_id}/join: Join a specific event.
    - POST /{event_id}/exit: Exit a specific event.
    - POST /{event_id}/mark-completed: Mark an event as completed for the current user.
"""

# app/routes/event_routes.py
import logging
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.handlers.auth import get_current_user
from app.db.session import get_db
from app.services.events_svc import (
    create_event,
    get_events_from_db,
    join_event,
    exit_event,
    mark_event_completed,
    get_user_created_events,
    get_user_joined_events,
    get_event_details_from_db,
)
from app.services.users_svc import get_user_id

router = APIRouter()

logger = logging.getLogger(__name__)


@router.post("/", response_model=dict)
def create_event_api(
    name: str,
    description: str,
    is_private: bool = True,
    flags: str = "user_created",
    current_username: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new event"""
    user_id = get_user_id(current_username, db)

    event_details = {
        "name": name,
        "description": description,
        "is_private": is_private,
        "created_by": user_id,
        "flags": flags,
    }

    return create_event(db, event_details)


@router.get("/", response_model=list[dict])
def get_events(
    # is_private: bool = Query(None),
    flags: str = Query(None),
    db: Session = Depends(get_db),
):
    """Retrieve a list of events"""
    return get_events_from_db(db, flags)


@router.get("/myevents", response_model=list[dict])
def get_my_events(
    current_user: str = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Retrieve a list of events created by the current user"""
    current_user_id = get_user_id(current_user, db)

    return get_user_created_events(db, current_user_id)


@router.get("/joinedevents", response_model=list[dict])
def get_joined_events(
    current_user: str = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Retrieve a list of events joined by the current user"""
    current_user_id = get_user_id(current_user, db)

    return get_user_joined_events(db, current_user_id)


@router.get("/{event_id}", response_model=dict)
def get_event_details(
    event_id: int,
    top_x: int = 100,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """Retrieve details of a specific event"""
    current_user_id = get_user_id(current_user, db)
    return get_event_details_from_db(db, event_id, top_x, current_user_id)


@router.post("/{event_id}/join", response_model=dict)
def join_event_api(event_id: int, user_id: int, db: Session = Depends(get_db)):
    """Join a specific event"""
    return join_event(db, user_id, event_id)


@router.post("/{event_id}/exit", response_model=dict)
def exit_event_api(event_id: int, user_id: int, db: Session = Depends(get_db)):
    """Exit a specific event"""
    # Check if the user is in the event
    return exit_event(db, user_id, event_id)


@router.post("/{event_id}/mark-completed")
async def mark_event_completed_api(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Mark an event as completed for the current user"""
    current_user_id = get_user_id(current_user, db)

    return await mark_event_completed(db, current_user_id, event_id)
