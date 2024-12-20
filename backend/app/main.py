"""
    The main entry point for the web service.
"""

# app/main.py
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import Base, engine
from app.routes import user_routes, event_routes, websocket
from app.handlers.scheduler import start_scheduler, stop_scheduler
from app.core.middlewares import LogRequestsMiddleware

# Configure logging
logging.basicConfig(
    level=int(settings.debug_level),  # Minimum log level for the application
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),  # Logs to console
        logging.FileHandler("app.log"),  # Logs to a file
    ],
)

Base.metadata.create_all(bind=engine)

app = FastAPI()


# Start the scheduler on application startup
@app.on_event("startup")
def startup_event():
    """Method to start the scheduler when the application starts up."""
    start_scheduler()
    print("Scheduler started.")


# Shutdown the scheduler on application shutdown
@app.on_event("shutdown")
def shutdown_event():
    """Method to stop the scheduler when the application shuts down."""
    stop_scheduler()
    print("Scheduler stopped.")


# Allow all origins
origins = ["*"]  # uvicorn app.main:app --host 0.0.0.0 --port 8000

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_blocked_requests(request: Request, call_next):
    """Middleware to log blocked requests."""
    response = await call_next(request)
    if (
        response.status_code == 403
    ):  # Assuming 403 is the status code for blocked requests
        client_host = request.client.host
        logger.warning("Blocked request from %s", client_host)
    return response


app.add_middleware(LogRequestsMiddleware)
# app.middleware("http")(log_requests)

logger = logging.getLogger(__name__)


@app.get("/")
def read_root():
    """
    The main entry point for the web service.

    Endpoints:
        - GET /: Returns the status of the web service.
    """
    logger.info("WebService is Running!")
    return {"Status": "WebService is Running!"}


app.include_router(user_routes.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(event_routes.router, prefix="/api/v1/events", tags=["Events"])
app.include_router(websocket.router, prefix="/ws", tags=["Websockets"])
