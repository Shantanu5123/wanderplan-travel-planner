# FastAPI ASGI application entrypoint with safe diagnostic fallback
import os
import sys
import traceback
import logging

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

try:
    from app.main import app
except Exception as e:
    err_type = type(e).__name__
    err_str = str(e)
    tb_str = traceback.format_exc()
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    app = FastAPI(title="WanderPlan Diagnostic Fallback")

    @app.api_route("/{rest_of_path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
    async def debug_catcher(rest_of_path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Backend failed to load on Vercel",
                "exception_type": err_type,
                "exception_message": err_str,
                "traceback": tb_str,
                "cwd": os.getcwd(),
                "sys_path": sys.path
            }
        )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
