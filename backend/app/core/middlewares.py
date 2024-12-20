"""
    This module contains custom middleware classes that can be used to intercept and process incoming requests.
"""

import logging
import time
from fastapi import Request
from fastapi.responses import JSONResponse
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
        except Exception:
            body = None  # Handle cases where body is not JSON or unavailable

        middleware_logger.info(
            "Received request: %s %s\nClient IP: %s\nHeaders: %s\nQuery Params: %s\nPayload: %s",
            request.method, request.url, client_ip, headers, query_params, body
        )

        # Process the request
        response = await call_next(request)

        process_time = time.time() - start_time

        # Log Response Metadata
        middleware_logger.info(
            "Response: %s - %s\nProcessing Time: %.2fs",
            response.status_code,
            response.headers.get('content-type', 'Unknown'),
            process_time
        )

        return response

# authentification middleware
class AuthMiddleware(BaseHTTPMiddleware):
    """Middleware to authenticate incoming requests."""

    async def dispatch(self, request: Request, call_next):
        # Perform authentication checks here
        # For example, check for presence of an Authorization header
        if "Authorization" not in request.headers:
            return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

        # Continue processing the request if authentication is successful
        response = await call_next(request)
        return response