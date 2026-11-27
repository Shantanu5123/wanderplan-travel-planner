from fastapi import FastAPI
from fastapi.responses import JSONResponse
import sys
import os

app = FastAPI()

# Add backend to path for app imports
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(root_dir, "backend")
for d in [root_dir, backend_dir]:
    if d not in sys.path:
        sys.path.insert(0, d)

@app.get("/api/v1/health")
def health():
    return {"status": "ok", "service": "WanderPlan API"}

@app.get("/api/health")
def health_alt():
    return {"status": "ok", "service": "WanderPlan API"}

try:
    from app.routers import itineraries, chat
    app.include_router(itineraries.router)
    app.include_router(chat.router)
except Exception as e:
    import traceback
    err_msg = str(e)
    tb_str = traceback.format_exc()
    @app.api_route("/api/v1/itineraries/{full_path:path}", methods=["GET", "POST", "OPTIONS"])
    def fallback_itinerary(full_path: str):
        return JSONResponse(status_code=500, content={"error": err_msg, "traceback": tb_str})



