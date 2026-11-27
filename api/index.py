import os
import sys
import traceback

current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(root_dir, "backend")

for d in [root_dir, backend_dir]:
    if d not in sys.path:
        sys.path.insert(0, d)

try:
    from app.main import app
except Exception as e:
    tb = traceback.format_exc()
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    app = FastAPI()

    @app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])
    async def catch_all(path_name: str):
        return JSONResponse(
            status_code=500,
            content={"error": str(e), "traceback": tb}
        )

