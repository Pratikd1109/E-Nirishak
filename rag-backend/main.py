from fastapi import FastAPI
from app.api.routes import router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

app = FastAPI(title="E-Maap-Nirikshak Portal & RAG API", version="1.0.0")

# Allow requests from all origins (suitable for local dev, Vercel, and Hugging Face)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "E-Maap-Nirikshak RAG API"}

# Check if production frontend build exists to serve full-stack unified app
DIST_DIR = os.path.join(os.path.dirname(__file__), "frontend_dist")
if os.path.exists(DIST_DIR):
    assets_dir = os.path.join(DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api"):
            return {"detail": "Not found"}
        target = os.path.join(DIST_DIR, full_path)
        if os.path.exists(target) and os.path.isfile(target):
            return FileResponse(target)
        return FileResponse(os.path.join(DIST_DIR, "index.html"))
else:
    @app.get("/")
    def read_root():
        return {
            "status": "healthy",
            "service": "E-Maap-Nirikshak RAG API",
            "docs": "/docs",
            "message": "Frontend not mounted. Running in standalone API mode."
        }
