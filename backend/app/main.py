from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import traces
from app.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 🔐 CORS (important pour Spring + Angular + tests Postman)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 📦 Routes API
app.include_router(traces.router)
# ❤️ Health check (important pour tester connexion Spring → Python)
@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": settings.APP_NAME
    }

# 🏠 Root endpoint
@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": settings.APP_NAME,
        "docs": "/docs"
    }