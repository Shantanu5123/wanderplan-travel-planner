import os
import sys
import traceback
import json

# Ensure directories are in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.dirname(current_dir)
backend_dir = os.path.join(root_dir, "backend")

for d in [root_dir, backend_dir]:
    if d not in sys.path:
        sys.path.insert(0, d)

# Diagnostic handler: captures any startup exception and exposes it over HTTP
_startup_error = None
_traceback_str = None

try:
    from app.main import app
except Exception as e:
    _startup_error = str(e)
    _traceback_str = traceback.format_exc()
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    app = FastAPI(title="WanderPlan API Error Recovery")

    @app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])
    async def catch_all_debug(path_name: str):
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": "Backend startup exception on Vercel",
                "error": _startup_error,
                "traceback": _traceback_str,
                "sys_path": sys.path,
                "cwd": os.getcwd(),
                "files_in_cwd": os.listdir(".") if os.path.exists(".") else []
            }
        )
