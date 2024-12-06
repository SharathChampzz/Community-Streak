# app/routes/event_routes.py
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CS_Events, CS_EventProps, CS_UserEvents, CS_Users
from sqlalchemy.orm import joinedload

router = APIRouter()

@router.post("/", response_model=dict)
def create_event(
    name: str,
    description: str,
    is_private: bool = False,
    flags: str = "user_created",
    user_id: int = None,
    db: Session = Depends(get_db)
):
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
    is_private: bool = Query(None),
    flags: str = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(CS_Events)
    
    # Apply filters if provided
    if is_private is not None:
        query = query.filter(CS_Events.is_private == is_private)
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


@router.get("/{event_id}", response_model=dict)
def get_event_details(
    event_id: int,
    top_x: int = 100,
    db: Session = Depends(get_db)
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

    return {
        "event_id": event.id,
        "name": event.name,
        "description": event.description,
        "created_by": event.created_by,
        "is_private": event.is_private,
        "flags": event.flags,
        "created_at": event.created_at,
        "top_users": users
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