"""
DecisioLens API — application entry point.

Configures the FastAPI application with:
- Structured JSON logging
- CORS middleware
- Centralized error handling + request timing
- Lifespan events for startup / shutdown
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from core.config import get_settings
from core.logging import get_logger, setup_logging
from core.middleware import register_middleware
from routers.audit import router as audit_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    settings = get_settings()
    setup_logging(level=settings.LOG_LEVEL)
    logger = get_logger("main")
    active_model = settings.GROQ_MODEL if settings.AI_PROVIDER == "groq" else settings.GEMINI_MODEL
    logger.info(
        "DecisioLens API starting (debug=%s, provider=%s, model=%s)",
        settings.DEBUG,
        settings.AI_PROVIDER,
        active_model,
    )
    yield
    logger.info("DecisioLens API shutting down")


settings = get_settings()

app = FastAPI(
    title="DecisioLens API",
    version="1.0.0",
    description="Production-ready AI decision auditing system",
    lifespan=lifespan,
    docs_url="/docs" if settings.API_DOCS_ENABLED else None,
    redoc_url="/redoc" if settings.API_DOCS_ENABLED else None,
    openapi_url="/openapi.json" if settings.API_DOCS_ENABLED else None,
)

# ── Host validation + CORS ───────────────────────────────────────────
# Temporarily disabled to rule out host header issues in production
# app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    from core.logging import get_logger
    logger = get_logger("main")
    logger.info("Incoming: %s %s | Host: %s", request.method, request.url.path, request.headers.get("host"))
    return await call_next(request)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Middleware & error handlers ──────────────────────────────────────
register_middleware(app)

# ── Routers ──────────────────────────────────────────────────────────
app.include_router(audit_router)


@app.get("/health")
async def health() -> dict[str, str]:
    """Lightweight readiness probe for load balancers."""
    return {"status": "ok"}
