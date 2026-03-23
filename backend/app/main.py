from fastapi import FastAPI
from .routers import meetings, tasks, users, auth, ai
from .models import user, meeting, task
from .database import Base, engine
from .middleware import SecurityHeadersMiddleware, LoggingMiddleware, RateLimitMiddleware
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Meeting Protocol API",
    description="JWT-protected API for managing meetings with role-based access control",
    version="1.0.0"
)

# Create tables
Base.metadata.create_all(bind=engine)

# Middleware (порядок важен!)
# 1. Rate limiting - первым чтобы отклонить спам
app.add_middleware(RateLimitMiddleware, requests_per_minute=100)

# 2. CORS для фронтенда
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Security headers
app.add_middleware(SecurityHeadersMiddleware)

# 4. Logging (последним чтобы логировать всё)
app.add_middleware(LoggingMiddleware)


@app.get("/")
def root():
    return {
        "message": "Meeting Manager API",
        "version": "1.0.0",
        "features": ["JWT authentication", "Role-based access control", "Meeting management"]
    }


@app.get("/health")
def health():
    return {"status": "ok"}


# Include routers
app.include_router(meetings.router)
app.include_router(tasks.router)
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(ai.router)

logger.info("Application started successfully")