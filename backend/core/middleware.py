"""
Centralized middleware and exception handlers for the FastAPI application.

- Global exception handler → structured JSON error responses
- Request timing middleware → logs latency per request
"""

from __future__ import annotations

import time
import uuid

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from core.logging import get_logger

logger = get_logger("middleware")


# ── Structured error response ────────────────────────────────────────

def _error_response(status_code: int, error: str, detail: str = "") -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "error": error,
            "detail": detail,
            "status_code": status_code,
        },
    )


# ── Exception handlers ──────────────────────────────────────────────

async def value_error_handler(_request: Request, exc: ValueError) -> JSONResponse:
    """Handle validation / business-rule violations → 400."""
    logger.warning("Validation error: %s", str(exc))
    return _error_response(400, "Validation Error", str(exc))


async def type_error_handler(_request: Request, exc: TypeError) -> JSONResponse:
    """Handle type-mismatch errors → 400."""
    logger.warning("Type error: %s", str(exc))
    return _error_response(400, "Type Error", str(exc))


async def generic_error_handler(_request: Request, exc: Exception) -> JSONResponse:
    """Catch-all for unhandled exceptions → 500."""
    logger.error("Unhandled exception: %s", str(exc), exc_info=True)
    return _error_response(500, "Internal Server Error", "An unexpected error occurred.")


async def overflow_error_handler(_request: Request, exc: OverflowError) -> JSONResponse:
    """Handle math overflow from extreme numeric inputs → 400."""
    logger.warning("Overflow error: %s", str(exc))
    return _error_response(400, "Validation Error", "Numeric value caused overflow — check input ranges.")


async def key_error_handler(_request: Request, exc: KeyError) -> JSONResponse:
    """Handle missing domain scorers or similar lookup failures → 400."""
    logger.warning("Key error: %s", str(exc))
    return _error_response(400, "Validation Error", str(exc))


async def request_validation_error_handler(
    _request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Normalize FastAPI's default 422 into our structured error shape.

    Without this handler, malformed JSON / type mismatches return
    FastAPI's default {detail: [...]} format which is inconsistent
    with our custom {error, detail, status_code} contract.
    """
    errors = exc.errors()
    # Build a concise human-readable summary
    messages = []
    for err in errors[:5]:  # cap at 5 to keep response small
        loc = " -> ".join(str(l) for l in err.get("loc", []))
        msg = err.get("msg", "invalid")
        messages.append(f"{loc}: {msg}" if loc else msg)
    detail = "; ".join(messages)
    logger.warning("Request validation error: %s", detail)
    return _error_response(422, "Request Validation Error", detail)


async def pydantic_validation_error_handler(
    _request: Request, exc: ValidationError
) -> JSONResponse:
    """Handle internal model validation triggered by client data as 400."""
    errors = exc.errors()
    messages = []
    for err in errors[:5]:
        loc = " -> ".join(str(l) for l in err.get("loc", []))
        msg = err.get("msg", "invalid")
        messages.append(f"{loc}: {msg}" if loc else msg)
    detail = "; ".join(messages) or str(exc)
    logger.warning("Pydantic validation error: %s", detail)
    return _error_response(400, "Validation Error", detail)


# ── Request timing middleware ────────────────────────────────────────

async def request_timing_middleware(request: Request, call_next):
    """Log every request with its latency and response status."""
    request_id = str(uuid.uuid4())[:8]
    start = time.perf_counter()

    response = await call_next(request)

    latency_ms = round((time.perf_counter() - start) * 1000, 2)
    logger.info(
        "%s %s -> %s (%.1fms)",
        request.method,
        request.url.path,
        response.status_code,
        latency_ms,
        extra={
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "latency_ms": latency_ms,
            "request_id": request_id,
        },
    )
    return response


# ── Registration helper ──────────────────────────────────────────────

def register_middleware(app: FastAPI) -> None:
    """Attach all middleware and exception handlers to the application."""

    # Exception handlers (most specific first).
    app.add_exception_handler(OverflowError, overflow_error_handler)
    app.add_exception_handler(KeyError, key_error_handler)
    app.add_exception_handler(ValueError, value_error_handler)
    app.add_exception_handler(TypeError, type_error_handler)
    app.add_exception_handler(RequestValidationError, request_validation_error_handler)
    app.add_exception_handler(ValidationError, pydantic_validation_error_handler)
    app.add_exception_handler(Exception, generic_error_handler)

    # Timing middleware.
    app.middleware("http")(request_timing_middleware)
