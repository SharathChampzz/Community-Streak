# app/routes/user_routes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import CS_Users, CS_UserEvents, CS_Events
from app.schemas import UserCreate, UserLogin, Token
from app.auth import hash_password, verify_password, create_access_token

router = APIRouter()

@router.post("/signup", response_model=dict)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(CS_Users).filter(CS_Users.email == user.email).first()
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
    return {"message": "User registered successfully"}

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(CS_Users).filter(CS_Users.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users", response_model=list[dict])
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(CS_Users).all()
    return [{"id": user.id, "username": user.username, "email": user.email, "flags": user.flags} for user in users]

@router.get("/users/{user_id}", response_model=dict)
def get_user_details(
    user_id: int,
    db: Session = Depends(get_db)
):
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
