"""
This module contains Pydantic schemas for the FastAPI application.
"""

# app/schemas.py
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    """User create schema to register a new user"""
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    """User login schema to authenticate a user"""
    email: EmailStr
    password: str


class Token(BaseModel):
    """Token schema to return access and refresh tokens"""
    access_token: str
    token_type: str
    refresh_token: str
