from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import get_settings
from .database import engine, Base
from .routers import projects, bom, fat, ai, production

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Import all models so SQLAlchemy registers them before creating tables
    from . import models  # noqa: F401
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="Akos AI MES API",
    description=(
        "Manufacturing Execution System with AI capabilities.\n\n"
        "Supports project management, BOM tree, FAT testing records, "
        "production orders, and AI-driven cost/lead-time predictions."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(projects.router, prefix="/api/v1/projects", tags=["Projects"])

# BOM router has mixed prefixes (/api/v1/projects/{id}/bom and /api/v1/bom/{id})
app.include_router(bom.router, prefix="/api/v1", tags=["BOM"])

# FAT router has mixed prefixes (/api/v1/projects/{id}/fat and /api/v1/fat/...)
app.include_router(fat.router, prefix="/api/v1", tags=["FAT"])

app.include_router(production.router, prefix="/api/v1/production", tags=["Production"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI"])


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "environment": settings.environment,
        "version": "1.0.0",
    }


@app.get("/api/v1", tags=["Health"])
async def api_root():
    return {
        "message": "Akos AI MES API v1",
        "docs": "/docs",
        "health": "/health",
    }
