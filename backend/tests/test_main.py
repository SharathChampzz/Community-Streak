"""
This file contains the tests for the main FastAPI application.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    """ Test the root endpoint """
    response = client.get("/")
    assert response.status_code == 404
    assert response.json() == {"Status": "WebService is Running!"}

def test_user_routes():
    """ Test the user routes """
    response = client.get("/api/v1/users")
    assert response.status_code == 200 or response.status_code == 404

def test_event_routes():
    """ Test the event routes """
    response = client.get("/api/v1/events")
    assert response.status_code == 200 or response.status_code == 401

def test_websocket_routes():
    """ Test the websocket routes """
    response = client.get("/ws")
    assert response.status_code == 200 or response.status_code == 404