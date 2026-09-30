from pathlib import Path
from pydantic_settings import BaseSettings

# .env lives at the workspace root: SIH'26/SIH26036/.env
# This file is at:            SIH'26/SIH26036/rag-backend/app/core/config.py
# So we go up 4 levels:       core -> app -> rag-backend -> SIH26036
_ENV_PATH = Path(__file__).resolve().parents[3] / ".env"


class Settings(BaseSettings):
    PROJECT_NAME: str = "E-Maap-Nirikshak RAG API"
    GEMINI_API_KEY: str          # Used only for embeddings (gemini-embedding-2)
    SARVAM_API_KEY: str          # Used for LLM generation (sarvam-m)
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX_NAME: str = "emaap-nirikshak-v2"

    model_config = {
        "env_file": str(_ENV_PATH),
        "env_file_encoding": "utf-8-sig",  # handles BOM-encoded files from Windows editors
        "case_sensitive": False,
    }


settings = Settings()
