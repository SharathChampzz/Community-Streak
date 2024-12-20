"""
This file contains the tests for the main FastAPI application.
"""

import os

# before importing set the required env variables
os.environ["SECRET_KEY"] = "your_secret_key_value"
os.environ["REFRESH_SECRET_KEY"] = "your_refresh_secret_key_value"
os.environ["DATABASE_URL"] = "sqlite:///./database/community_streak.db"
os.environ["DEBUG_LEVEL"] = "10"


from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_read_root():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"Status": "WebService is Running!"}


def test_user_routes():
    """Test the user routes"""
    response = client.get("/api/v1/users")
    assert response.status_code in [200, 404]


def test_event_routes():
    """Test the event routes"""
    response = client.get("/api/v1/events")
    assert response.status_code in [200, 401]


def test_websocket_routes():
    """Test the websocket routes"""
    response = client.get("/ws")
    assert response.status_code in [200, 404]
