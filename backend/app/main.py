# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routes import user_routes, event_routes

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Allow all localhost origins
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(user_routes.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(event_routes.router, prefix="/api/v1/events", tags=["Events"])
