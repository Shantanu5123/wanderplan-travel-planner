import os
from typing import List


class Settings:
    def __init__(self):
        self._load_env_file()

        self.APP_ENV: str = os.getenv("APP_ENV", "development")
        self.PORT: int = int(os.getenv("PORT", "8000"))
        self.CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
        
        # Groq API
        self.GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
        self.GROQ_MODEL: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
        
        # Supabase Configuration
        raw_supabase_url = os.getenv("SUPABASE_URL", "")
        if "/rest/v1" in raw_supabase_url:
            raw_supabase_url = raw_supabase_url.split("/rest/v1")[0]
        self.SUPABASE_URL: str = raw_supabase_url.rstrip("/")
        self.SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
        self.SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        self.SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")

    def _load_env_file(self):
        env_paths = [".env", "backend/.env", "../backend/.env"]
        for path in env_paths:
            if os.path.exists(path):
                with open(path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            key, val = line.split("=", 1)
                            key = key.strip()
                            val = val.strip().strip('"').strip("'")
                            if key not in os.environ:
                                os.environ[key] = val
                break

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
