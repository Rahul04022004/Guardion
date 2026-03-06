"""
Guardion Configuration
Loads environment variables and defines app-wide settings.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    # Gemini AI API key for vulnerability remediation
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # Server configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # SQLite database path
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./guardion.db")

    # CORS allowed origins (extension + dashboard)
    CORS_ORIGINS: list[str] = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:5173,chrome-extension://*"
    ).split(",")

    # Temp directory for cloning repos
    TEMP_DIR: str = os.getenv("TEMP_DIR", "./tmp_repos")

    # OSV API endpoint for vulnerability lookups
    OSV_API_URL: str = "https://api.osv.dev/v1/query"


settings = Settings()
