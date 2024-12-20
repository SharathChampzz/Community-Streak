"""
This module is used to load environment variables from a .env file.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Class to load environment variables from .env file."""

    secret_key: str
    token_refresh_key: str
    database_url: str
    debug_level: int

    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_access_token_expire_days: int = 7

    class Config:
        """Class to set the configuration for the settings class."""

        env_file = ".env"


settings = Settings()


print(f"Secret key: {settings.secret_key}")
print(f"Refresh secret key: {settings.token_refresh_key}")
print(f"Database URL: {settings.database_url}")
print(f"Debug level: {settings.debug_level}")
