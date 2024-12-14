"""
This module contains middleware components for the FastAPI application.
Classes:
    LogRequestsMiddleware: Middleware to log incoming requests and response metadata.

    Methods:
        dispatch(request: Request, call_next): Logs request details, processes the request, and logs response metadata.
"""

import logging
import time
import json
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

middleware_logger = logging.getLogger("middleware")


class LogRequestsMiddleware(BaseHTTPMiddleware):
    """Logs incoming requests and response metadata."""

    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        # Log Request Details
        client_ip = request.client.host if request.client else "Unknown"
        headers = dict(request.headers)
        query_params = dict(request.query_params)

        try:
            body = await request.json()
        except json.JSONDecodeError:
            body = None  # Handle cases where body is not JSON or unavailable

        middleware_logger.info(
            "Received request: %s %s\nClient IP: %s\nHeaders: %s\nQuery Params: %s\nPayload: %s",
            request.method,
            request.url,
            client_ip,
            headers,
            query_params,
            body,
        )

        # Process the request
        response = await call_next(request)

        process_time = time.time() - start_time

        # Log Response Metadata
        middleware_logger.info(
            "Response: %s - %s\nProcessing Time: %.2fs",
            response.status_code,
            response.headers.get("content-type", "Unknown"),
            process_time,
        )
        middleware_logger.info(
            "Response: %s - %s\nProcessing Time: %.2fs",
            response.status_code,
            response.headers.get("content-type", "Unknown"),
            process_time,
        )
