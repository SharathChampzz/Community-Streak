# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.middlewares import LogRequestsMiddleware
from app.database import Base, engine
from app.routes import user_routes, event_routes, websocket
from app.scheduler import start_scheduler, stop_scheduler

import logging

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Start the scheduler on application startup
@app.on_event("startup")
def startup_event():
    start_scheduler()
    print("Scheduler started.")

# Shutdown the scheduler on application shutdown
@app.on_event("shutdown")
def shutdown_event():
    stop_scheduler()
    print("Scheduler stopped.")

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

app.add_middleware(LogRequestsMiddleware)
# app.middleware("http")(log_requests)


app.include_router(user_routes.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(event_routes.router, prefix="/api/v1/events", tags=["Events"])
app.include_router(websocket.router, prefix="/ws", tags=["Websockets"])

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,  # Minimum log level for the application
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),  # Logs to console
        logging.FileHandler("app.log"),  # Logs to a file
    ],
)


logger = logging.getLogger("app")