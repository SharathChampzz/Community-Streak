# app/main.py
from fastapi import FastAPI
from app.database import Base, engine
from app.routes import user_routes, event_routes

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(user_routes.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(event_routes.router, prefix="/api/v1/events", tags=["Events"])
