import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "VoiceBridge Backend"

    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://your-frontend-domain.com"
    ]

    WHISPER_MODEL: str = os.getenv("WHISPER_MODEL", "base")
    WHISPER_DEVICE: str = os.getenv("WHISPER_DEVICE", "cpu")

    ELEVENLABS_API_KEY: str
    ELEVENLABS_VOICE_ID: str = "default"

    HUGGINGFACE_TOKEN: str
    HUGGINGFACE_MODEL_REPO: str = "cdl-inclusion/nairobo_innovation_sprint"

    UPLOAD_DIR: str = "data/voice_samples"
    MODEL_DIR: str = "data/trained_models"

    DATABASE_URL: str = "sqlite:///./voicebridge.db"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# instantiate
settings = Settings()
