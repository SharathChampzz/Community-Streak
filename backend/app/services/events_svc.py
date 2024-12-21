"""This module contains the service methods for the events."""

from typing import List
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from app.db.models import CS_Events, CS_Users, CS_EventProps, CS_UserEvents


def create_event(db: Session, event_details: dict) -> CS_Events:
    """Method to create an event."""
    event = CS_Events(**event_details)
    db.add(event)
    db.commit()
    db.refresh(event)

    return {
        "message": "Event created successfully",
        "event": {
            "id": event.id,
            "name": event.name,
            "description": event.description,
            "created_by": event.created_by,
            "is_private": event.is_private,
            "flags": event.flags,
            "created_at": event.created_at,
        },
    }


def fetch_joined_events_for_user(db: Session, user_id: int) -> List[CS_Events]:
    """Method to fetch all events joined by a user."""
    return (
        db.query(CS_Events)
        .join(CS_UserEvents, CS_UserEvents.event_id == CS_Events.id)
        .filter(CS_UserEvents.user_id == user_id)
        .all()
    )


def get_streak_count(db: Session, user_id: int, event_id: int) -> int:
    """Method to get the streak count for a user in an event."""
    return (
        db.query(CS_UserEvents)
        .filter(
            CS_UserEvents.event_id == event_id,
            CS_UserEvents.user_id == user_id,
        )
        .first()
    )


def get_events_from_db(db: Session, flags: str) -> List[dict]:
    """Method to get all events from the database."""
    query = db.query(CS_Events)

    if flags:
        query = query.filter(CS_Events.flags == flags)

    events = query.all()
    result = []
    for event in events:
        # Get event props
        props = db.query(CS_EventProps).filter(CS_EventProps.event_id == event.id).all()
        event_props = [
            {"name": prop.prop_name, "value": prop.prop_value} for prop in props
        ]
        result.append(
            {
                "id": event.id,
                "name": event.name,
                "description": event.description,
                "created_by": event.created_by,
                "is_private": event.is_private,
                "flags": event.flags,
                "created_at": event.created_at,
                "props": event_props,
            }
        )

    return result


def get_user_created_events(db: Session, user_id: int) -> List[CS_Events]:
    """Method to get all events created by a user."""
    # Fetch all joined events and streaks
    user_events = (
        db.query(CS_Events)
        .join(CS_Users, CS_Users.id == CS_Events.created_by)
        .filter(CS_Users.id == user_id)
        .all()
    )
    events = []
    for ue in user_events:
        # Get event props
        props = db.query(CS_EventProps).filter(CS_EventProps.event_id == ue.id).all()
        event_props = [
            {"name": prop.prop_name, "value": prop.prop_value} for prop in props
        ]

        streak_count = get_streak_count(db, user_id, ue.id)

        events.append(
            {
                "id": ue.id,
                "name": ue.name,
                "description": ue.description,
                "created_by": ue.created_by,
                "is_private": ue.is_private,
                "flags": ue.flags,
                "created_at": ue.created_at,
                "props": event_props,
                "streak_count": streak_count.streak_count if streak_count else 0,
            }
        )
    return events


def get_user_joined_events(db: Session, user_id: int) -> List[CS_Events]:
    """Method to get all events joined by a user."""
    # Fetch all joined events and streaks
    user_events = fetch_joined_events_for_user(db, user_id)
    events = []
    for ue in user_events:
        # Get event props
        props = db.query(CS_EventProps).filter(CS_EventProps.event_id == ue.id).all()
        event_props = [
            {"name": prop.prop_name, "value": prop.prop_value} for prop in props
        ]

        streak_count = get_streak_count(db, user_id, ue.id)
        events.append(
            {
                "id": ue.id,
                "name": ue.name,
                "description": ue.description,
                "created_by": ue.created_by,
                "is_private": ue.is_private,
                "flags": ue.flags,
                "created_at": ue.created_at,
                "props": event_props,
                "streak_count": streak_count.streak_count if streak_count else 0,
            }
        )
    return events


def join_event(db: Session, user_id: int, event_id: int) -> bool:
    """Method to join a user to an event."""
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


def exit_event(db: Session, user_id: int, event_id: int) -> bool:
    """Method to exit a user from an event."""
    # Check if the event exists
    event = db.query(CS_Events).filter(CS_Events.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Check if user is in the event
    existing = (
        db.query(CS_UserEvents)
        .filter(CS_UserEvents.event_id == event_id, CS_UserEvents.user_id == user_id)
        .first()
    )

    if not existing:
        return {"message": "User is not part of the event"}

    # Remove user from event
    db.delete(existing)
    db.commit()
    return {"message": "User successfully exited the event"}


async def mark_event_completed(db: Session, user_id: int, event_id: int) -> bool:
    """Method to mark an event as completed for a user."""
    # Fetch user-event record
    user_event = (
        db.query(CS_UserEvents)
        .filter(CS_UserEvents.user_id == user_id, CS_UserEvents.event_id == event_id)
        .first()
    )

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

    return {
        "message": "Streak updated successfully",
        "streak_count": user_event.streak_count,
    }


def get_event_details_from_db(
    db: Session, event_id: int, top_x: int, user_id: int
) -> dict:
    """Retrieve details of a specific event"""
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
        {
            "userid": user_event.user_id,
            "username": user_event.user.username,
            "streak_count": user_event.streak_count,
        }
        for user_event in top_users
    ]

    # Get user's details for the event
    #     #1. Check if the current user is part of the event
    #     #2. If yes, get the streak count, last modified timestamp and rank
    #     #3. If no, add status as "Not part of the event"
    #     #4. If not modified today, set param to update streak

    # current_user_id = get_user_id(current_user, db)

    user_event = (
        db.query(CS_UserEvents)
        .filter(CS_UserEvents.event_id == event_id, CS_UserEvents.user_id == user_id)
        .first()
    )

    if user_event:
        user_details = {
            "streak_count": user_event.streak_count,
            "last_modified": user_event.modified,
            "rank": next((i for i, x in enumerate(users) if x["userid"] == user_id), -1)
            + 1,
            "status": "Part of the event",
            "request_update_streak": (
                user_event.modified.date() != datetime.utcnow().date()
                if user_event.modified
                else True
            ),
        }
    else:
        user_details = {"status": "Not part of the event"}

    # check user counts in event
    user_counts = (
        db.query(CS_UserEvents).filter(CS_UserEvents.event_id == event_id).count()
    )

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
        "user_counts": user_counts,
    }
