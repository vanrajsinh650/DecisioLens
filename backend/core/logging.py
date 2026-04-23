"""
Structured JSON logging for Cloud Run-compatible observability.

Configures Python's stdlib ``logging`` with a custom JSON formatter so
every log line is a parseable JSON object with timestamp, level, logger
name, and message.
"""

from __future__ import annotations

import json
import logging
import sys
from datetime import datetime, timezone


class JSONFormatter(logging.Formatter):
    """Emit each log record as a single-line JSON object."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry: dict = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Attach extra context when present (e.g. audit_id, latency_ms).
        for key in ("audit_id", "latency_ms", "status_code", "method", "path"):
            value = getattr(record, key, None)
            if value is not None:
                log_entry[key] = value

        if record.exc_info and record.exc_info[1] is not None:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry, default=str, ensure_ascii=False)


def setup_logging(level: str = "INFO") -> None:
    """
    Configure the root logger with JSON output to *stdout*.

    Should be called exactly once during application startup.
    """

    numeric_level = getattr(logging, level.upper(), logging.INFO)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JSONFormatter())

    root = logging.getLogger()
    root.setLevel(numeric_level)

    # Remove any existing handlers to avoid duplicates on reload.
    root.handlers.clear()
    root.addHandler(handler)

    # Silence noisy third-party loggers.
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Return a named logger bound to the application hierarchy."""
    return logging.getLogger(f"decisiolens.{name}")
