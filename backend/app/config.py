import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b").strip()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()

DATA_DIR = BASE_DIR / "backend" / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
SQLITE_DB_PATH = DATA_DIR / "gapfinder.db"

UPLOADS_DIR = BASE_DIR / "backend" / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

APP_PORT = int(os.getenv("PORT", 8000))
APP_HOST = os.getenv("HOST", "0.0.0.0")

