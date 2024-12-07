# app/routes/event_routes.py
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CS_Events, CS_EventProps, CS_UserEvents, CS_Users
from sqlalchemy.orm import joinedload
from sqlalchemy import or_
from app.auth import get_current_user, get_user_id
from datetime import datetime
import logging

router = APIRouter()

logger = logging.getLogger(__name__)

@router.post("/", response_model=dict)
def create_event(
    name: str,
    description: str,
    is_private: bool = True,
    flags: str = "user_created",
    current_username: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = get_user_id(current_username, db)
    # Validate user_id if provided
    if user_id:
        user = db.query(CS_Users).filter(CS_Users.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
    else:
        raise HTTPException(status_code=400, detail="Creator (user_id) is required")

    # Create the event
    new_event = CS_Events(
        name=name,
        description=description,
        created_by=user_id,
        is_private=is_private,
        flags=flags
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return {
        "message": "Event created successfully",
        "event": {
            "id": new_event.id,
            "name": new_event.name,
            "description": new_event.description,
            "created_by": new_event.created_by,
            "is_private": new_event.is_private,
            "flags": new_event.flags,
            "created_at": new_event.created_at,
        }
    }

@router.get("/", response_model=list[dict])
def get_events(
    # is_private: bool = Query(None),
    flags: str = Query(None),
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(CS_Events)
    
    current_user_id = get_user_id(current_user, db)

    # Apply filters if provided
    # if is_private is not None:
    #     query = query.filter(CS_Events.is_private == is_private)
    if flags:
        query = query.filter(CS_Events.flags == flags)
    
    events = query.all()
    result = []
    for event in events:
        # Get event props
        props = db.query(CS_EventProps).filter(CS_EventProps.event_id == event.id).all()
        event_props = [{"name": prop.prop_name, "value": prop.prop_value} for prop in props]
        result.append({
            "id": event.id,
            "name": event.name,
            "description": event.description,
            "created_by": event.created_by,
            "is_private": event.is_private,
            "flags": event.flags,
            "created_at": event.created_at,
            "props": event_props
        })
    return result

@router.get("/myevents", response_model=list[dict])
def get_my_events(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user_id = get_user_id(current_user, db)

    # Fetch all joined events and streaks
    user_events = (
        db.query(CS_Events)
        .join(CS_Users, CS_Users.id == CS_Events.created_by)
        .filter(CS_Users.id == current_user_id)
        .all()
    )
    events = []
    for ue in user_events:
        # Get event props
        props = db.query(CS_EventProps).filter(CS_EventProps.event_id == ue.id).all()
        event_props = [{"name": prop.prop_name, "value": prop.prop_value} for prop in props]

        streak_count = (
            db.query(CS_UserEvents)
            .filter(CS_UserEvents.event_id == ue.id, CS_UserEvents.user_id == current_user_id)
            .first()
        )
        events.append({
            "id": ue.id,
            "name": ue.name,
            "description": ue.description,
            "created_by": ue.created_by,
            "is_private": ue.is_private,
            "flags": ue.flags,
            "created_at": ue.created_at,
            "props": event_props,
            "streak_count": streak_count.streak_count if streak_count else 0
        })
    return events

@router.get("/joinedevents", response_model=list[dict])
def get_joined_events(
    current_user: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user_id = get_user_id(current_user, db)

    # Fetch all joined events and streaks
    user_events = (
        db.query(CS_Events)
        .join(CS_UserEvents, CS_UserEvents.event_id == CS_Events.id)
        .filter(CS_UserEvents.user_id == current_user_id)
        .all()
    )
    events = []
    for ue in user_events:
        # Get event props
        props = db.query(CS_EventProps).filter(CS_EventProps.event_id == ue.id).all()
        event_props = [{"name": prop.prop_name, "value": prop.prop_value} for prop in props]

        streak_count = (
            db.query(CS_UserEvents)
            .filter(CS_UserEvents.event_id == ue.id, CS_UserEvents.user_id == current_user_id)
            .first()
        )
        events.append({
            "id": ue.id,
            "name": ue.name,
            "description": ue.description,
            "created_by": ue.created_by,
            "is_private": ue.is_private,
            "flags": ue.flags,
            "created_at": ue.created_at,
            "props": event_props,
            "streak_count": streak_count.streak_count if streak_count else 0
        })
    return events

@router.get("/{event_id}", response_model=dict)
def get_event_details(
    event_id: int,
    top_x: int = 100,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    # Get event details
    event = db.query(CS_Events).filter(CS_Events.id == event_id).first()
    if not event:
        return {"error": "Event not found"}
    
    # Get top X users by streak count
    top_users = (
        db.query(CS_UserEvents)
        .options(joinedload(CS_UserEvents.user))
        .filter(CS_UserEvents.event_id == event_id)
        .order_by(CS_UserEvents.streak_count.desc())
        .limit(top_x)
        .all()
    )

    users = [
        {"userid": user_event.user_id, "username": user_event.user.username, "streak_count": user_event.streak_count}
        for user_event in top_users
    ]

    """
        Get user's details for the event
            #1. Check if the current user is part of the event
            #2. If yes, get the streak count, last modified timestamp and rank
            #3. If no, add status as "Not part of the event"
            #4. If not modified today, set param to update streak
    """
    current_user_id = get_user_id(current_user, db)
    logger.info(f"Fetching event details for user {current_user}:{current_user_id}")
    
    user_event = db.query(CS_UserEvents).filter(
        CS_UserEvents.event_id == event_id,
        CS_UserEvents.user_id == current_user_id
    ).first()

    if user_event:
        user_details = {
            "streak_count": user_event.streak_count,
            "last_modified": user_event.modified,
            "rank": next((i for i, x in enumerate(users) if x["userid"] == current_user_id), -1) + 1,
            "status": "Part of the event", # TODO: Use enum
            "request_update_streak": user_event.modified.date() != datetime.utcnow().date() if user_event.modified else True
        }
    else:
        user_details = {"status": "Not part of the event"}

    # check user counts in event
    user_counts = db.query(CS_UserEvents).filter(CS_UserEvents.event_id == event_id).count()

    return {
        "event_id": event.id,
        "name": event.name,
        "description": event.description,
        "created_by": event.created_by,
        "is_private": event.is_private,
        "flags": event.flags,
        "created_at": event.created_at,
        "top_users": users,
        "user_details": user_details,
        "user_counts": user_counts
    }

@router.post("/{event_id}/join", response_model=dict)
def join_event(
    event_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    # Check if the event exists
    event = db.query(CS_Events).filter(CS_Events.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Check if user is already in the event
    existing = (
        db.query(CS_UserEvents)
        .filter(CS_UserEvents.event_id == event_id, CS_UserEvents.user_id == user_id)
        .first()
    )
    if existing:
        return {"message": "User already joined the event"}
    
    # Add user to event
    new_user_event = CS_UserEvents(event_id=event_id, user_id=user_id)
    db.add(new_user_event)
    db.commit()
    return {"message": "User successfully joined the event"}

@router.post("/{event_id}/exit", response_model=dict)
def exit_event(
    event_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    # Check if the user is in the event
    user_event = (
        db.query(CS_UserEvents)
        .filter(CS_UserEvents.event_id == event_id, CS_UserEvents.user_id == user_id)
        .first()
    )
    if not user_event:
        return {"error": "User is not part of the event"}
    
    # Remove user from event
    db.delete(user_event)
    db.commit()
    return {"message": "User successfully exited the event"}

@router.post("/{event_id}/mark-completed")
async def mark_event_completed(event_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    current_user_id = get_user_id(current_user, db)

    # Fetch user-event record
    user_event = db.query(CS_UserEvents).filter(
        CS_UserEvents.user_id == current_user_id,
        CS_UserEvents.event_id == event_id
    ).first()

    if not user_event:
        raise HTTPException(status_code=404, detail="Event not found for the user")

    # Check if already marked for today
    last_modified = user_event.modified
    today = datetime.utcnow().date()

    if last_modified and last_modified.date() == today:
        raise HTTPException(status_code=400, detail="Streak already updated for today")

    # Update streak and modified timestamp
    user_event.streak_count += 1
    user_event.modified = datetime.utcnow()
    db.commit()

    return {"message": "Streak updated successfully", "streak_count": user_event.streak_count}
