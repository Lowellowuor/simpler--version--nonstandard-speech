from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

from app.api.endpoints import speech_to_text, text_to_speech, voice_profiles, training, health
from app.core.config import settings

# Load environment variables
load_dotenv()

app = FastAPI(
    title="VoiceBridge Backend",
    description="Backend for non-standard speech voice personalization",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(speech_to_text.router, prefix="/api", tags=["speech-to-text"])
app.include_router(text_to_speech.router, prefix="/api", tags=["text-to-speech"])
app.include_router(voice_profiles.router, prefix="/api/voice", tags=["voice-profiles"])
#app.include_router(training.router, prefix="/api/voice", tags=["training"])

# Mount static files for audio samples
app.mount("/static", StaticFiles(directory="data"), name="static")

@app.get("/")
async def root():
    return {"message": "VoiceBridge Backend API", "status": "healthy"}