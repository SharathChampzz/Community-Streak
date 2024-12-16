"""
    This file contains the SQLAlchemy models for the application.
"""

# app/models.py
from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from .database import Base


class CS_Users(Base):
    """ Model to store users """
    __tablename__ = "cs_users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    flags = Column(String, default="regular")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user_events = relationship("CS_UserEvents", back_populates="user")
    user_props = relationship("CS_UserProps", back_populates="user")
    created_events = relationship(
        "CS_Events", back_populates="created_by_user")


class CS_Events(Base):
    """ Model to store events """
    __tablename__ = "cs_events"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    created_by = Column(Integer, ForeignKey("cs_users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_private = Column(Boolean, default=False)
    flags = Column(String, default="user_created")

    # Relationships
    created_by_user = relationship("CS_Users", back_populates="created_events")
    event_props = relationship("CS_EventProps", back_populates="event")
    user_events = relationship("CS_UserEvents", back_populates="event")


class CS_UserProps(Base):
    """ Model to store user properties """
    __tablename__ = "cs_user_props"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("cs_users.id"), nullable=False)
    attribute_name = Column(String, nullable=False)
    attribute_value = Column(Text, nullable=False)
    # Null if valid, timestamp if invalid
    modified = Column(DateTime, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("CS_Users", back_populates="user_props")


class CS_EventProps(Base):
    """ Model to store event properties """
    __tablename__ = "cs_event_props"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("cs_events.id"), nullable=False)
    prop_name = Column(String, nullable=False)
    prop_value = Column(Text, nullable=False)
    # Null if valid, timestamp if invalid
    modified = Column(DateTime, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Relationships
    event = relationship("CS_Events", back_populates="event_props")


class CS_UserEvents(Base):
    """ Model to store user event relationships """
    __tablename__ = "cs_user_events"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("cs_users.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("cs_events.id"), nullable=False)
    streak_count = Column(Integer, default=0)
    modified = Column(DateTime, nullable=True)  # Last modification timestamp
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("CS_Users", back_populates="user_events")
    event = relationship("CS_Events", back_populates="user_events")
