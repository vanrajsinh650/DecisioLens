from __future__ import annotations

from fastapi import FastAPI

from routers.audit import router as audit_router


app = FastAPI(title="DecisioLens API", version="0.1.0")
app.include_router(audit_router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
