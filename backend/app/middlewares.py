from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import logging
import time

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
            f"Received request: {request.method} {request.url}\n"
            f"Client IP: {client_ip}\n"
            f"Headers: {headers}\n"
            f"Query Params: {query_params}\n"
            f"Payload: {body}"
        )

        # Process the request
        response = await call_next(request)

        process_time = time.time() - start_time

        # Log Response Metadata
        middleware_logger.info(
            f"Response: {response.status_code} - {response.headers.get('content-type', 'Unknown')}\n"
            f"Processing Time: {process_time:.2f}s"
        )

        return response
