import time
import logging
from collections import defaultdict
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import itineraries, chat

logger = logging.getLogger("travel_app")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

# In-memory sliding window rate limiter (Point 2: Rate Limiting & Point 90: Brute Force Protection)
# Max 40 requests per minute per client IP for AI/compute intensive endpoints
RATE_LIMIT_WINDOW = 60.0
RATE_LIMIT_MAX_REQUESTS = 40
_ip_request_history = defaultdict(list)

# Max request payload size: 1 MB (Point 23: API Gateways payload limits)
MAX_CONTENT_LENGTH = 1024 * 1024

app = FastAPI(
    title="Personalized Travel Itinerary Planner API",
    description="Backend API for AI-powered personalized travel itinerary generation, chat concierge, editing, and sharing.",
    version="0.2.0",
)

# Domain 1, 3, 7: Security Headers & Rate Limiting Middleware (Points 2, 81, 82, 83)
@app.middleware("http")
async def security_and_rate_limit_middleware(request: Request, call_next):
    # Handle CORS preflight OPTIONS requests immediately
    if request.method == "OPTIONS":
        return await call_next(request)

    # Enforce payload size limits on POST / PUT / PATCH
    if request.method in ["POST", "PUT", "PATCH"]:
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > MAX_CONTENT_LENGTH:
            return JSONResponse(
                status_code=413,
                content={"detail": "Payload Too Large: maximum allowed size is 1MB."}
            )

    # Per-IP Rate Limiting for API routes
    if request.url.path.startswith("/api/v1/"):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        # Clean older entries
        recent = [t for t in _ip_request_history[client_ip] if now - t < RATE_LIMIT_WINDOW]
        if len(recent) >= RATE_LIMIT_MAX_REQUESTS:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please slow down and try again later."}
            )
        recent.append(now)
        _ip_request_history[client_ip] = recent

    response: Response = await call_next(request)

    # Inject Essential Security Headers (Points 81, 82, 83)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(self), camera=(), microphone=()"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Centralized Safe Exception Handler (Point 9: Error Handling - no stack traces leaked)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again or contact support."}
    )

# CORS setup for frontend
# Allow all origins in production or when CORS_ORIGINS includes '*'
cors_origins = settings.cors_origins_list
allow_all = "*" in cors_origins or len(cors_origins) == 0

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all else cors_origins,
    allow_credentials=False if allow_all else True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(itineraries.router)
app.include_router(chat.router)

# Direct alias for /api/swap-activity as requested in prompt
@app.post("/api/swap-activity")
def swap_activity_direct(req: itineraries.SwapActivityRequest):
    return itineraries.swap_activity_endpoint(req)


@app.get("/", tags=["Root"])
def root():
    return {
        "status": "online",
        "service": "Personalized Travel Itinerary Planner API",
        "docs": "/docs"
    }


@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "app_env": settings.APP_ENV,
        "service": "travel-itinerary-backend"
    }

# Liveness and Readiness Probes (Point 48: Health Checks)
@app.get("/healthz", tags=["Health"])
def liveness():
    return {"status": "ok"}

@app.get("/readyz", tags=["Health"])
def readiness():
    is_ready = bool(settings.GROQ_API_KEY)
    return {
        "status": "ready" if is_ready else "degraded",
        "groq_configured": bool(settings.GROQ_API_KEY),
        "supabase_configured": bool(settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY),
    }
