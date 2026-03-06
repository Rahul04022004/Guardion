"""
Guardion — Main Application Entry Point
FastAPI server with CORS, route registration, and database initialization.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.api.prompt_routes import router as prompt_router
from app.api.repo_routes import router as repo_router
from app.api.dashboard_routes import router as dashboard_router

# ──────────────────── App Initialization ────────────────────

app = FastAPI(
    title="Guardion",
    description="AI Prompt Security + Repository Vulnerability Scanner",
    version="1.0.0",
    docs_url="/docs",          # Swagger UI at /docs
    redoc_url="/redoc",        # ReDoc at /redoc
)

# ──────────────────── CORS Configuration ────────────────────
# Allow requests from the React dashboard and Chrome extension

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Permissive for hackathon; tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────── Register Routers ────────────────────

app.include_router(prompt_router)
app.include_router(repo_router)
app.include_router(dashboard_router)

# ──────────────────── Startup Events ────────────────────


@app.on_event("startup")
async def startup():
    """Initialize database tables on server start."""
    init_db()
    print("✅ Guardion backend started — database initialized")


# ──────────────────── Health Check ────────────────────


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint — confirms the server is running."""
    return {
        "service": "Guardion",
        "status": "operational",
        "version": "1.0.0",
        "endpoints": {
            "analyze_prompt": "POST /api/analyze_prompt",
            "scan_repo": "POST /api/scan_repo",
            "remediate": "POST /api/remediate",
            "dashboard": "GET /api/dashboard",
            "docs": "GET /docs",
        },
    }


# ──────────────────── Direct Run ────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
    )
