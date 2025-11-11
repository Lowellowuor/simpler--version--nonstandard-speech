from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from app.services.voice_training_service import voice_training_service
from app.services.whisper_service import whisper_service
import os
import uuid

router = APIRouter()

class VoiceProfileCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    tone: str = "neutral"
    speaking_rate: float = 1.0
    stability: float = 0.5
    similarity: float = 0.75
    speech_characteristics: Dict[str, Any] = {}

@router.get("/profiles")
async def get_voice_profiles():
    try:
        profiles = voice_training_service._load_profiles()
        return {"success": True, "profiles": profiles}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get profiles: {str(e)}")

@router.post("/profiles")
async def create_voice_profile(profile_data: VoiceProfileCreate):
    try:
        profile = voice_training_service.create_voice_profile(profile_data.dict())
        return {"success": True, "profile": profile}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create profile: {str(e)}")

@router.post("/upload-sample")
async def upload_voice_sample(
    audio: UploadFile = File(...),
    phrase: str = Form(...),
    category: str = Form("general"),
    profile_id: str = Form(...),
    speech_characteristics: str = Form("{}")
):
    try:
        # Save audio file
        file_extension = os.path.splitext(audio.filename)[1]
        filename = f"{uuid.uuid4()}{file_extension}"
        file_path = f"data/voice_samples/{filename}"
        
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, "wb") as f:
            f.write(await audio.read())
        
        # Transcribe audio for accuracy check
        transcription_result = whisper_service.transcribe_audio(file_path)
        
        # Calculate sample duration (simplified)
        file_size = os.path.getsize(file_path)
        duration = file_size / 16000  # Rough estimate
        
        sample_data = {
            "phrase": phrase,
            "audio_path": file_path,
            "category": category,
            "duration": duration,
            "accuracy": transcription_result["confidence"],
            "transcription": transcription_result["text"],
            "confidence": transcription_result["confidence"],
            "speech_characteristics": eval(speech_characteristics)
        }
        
        sample = voice_training_service.add_voice_sample(profile_id, sample_data)
        
        return {
            "success": True,
            "sample_id": sample["id"],
            "duration": duration,
            "accuracy": transcription_result["confidence"],
            "transcription": transcription_result["text"],
            "confidence": transcription_result["confidence"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload sample: {str(e)}")

@router.post("/profiles/{profile_id}/train")
async def train_voice_model(profile_id: str):
    try:
        result = voice_training_service.train_voice_model(profile_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@router.post("/profiles/{profile_id}/activate")
async def activate_voice_profile(profile_id: str):
    try:
        profile = voice_training_service._get_profile(profile_id)
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        # Deactivate all other profiles
        profiles = voice_training_service._load_profiles()
        for p in profiles:
            p["is_active"] = (p["id"] == profile_id)
            voice_training_service._save_profile(p)
        
        return {"success": True, "message": "Profile activated"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Activation failed: {str(e)}")

@router.delete("/profiles/{profile_id}")
async def delete_voice_profile(profile_id: str):
    try:
        profiles = voice_training_service._load_profiles()
        profiles = [p for p in profiles if p["id"] != profile_id]
        
        with open(voice_training_service.profiles_file, 'w') as f:
            json.dump(profiles, f, indent=2)
        
        return {"success": True, "message": "Profile deleted"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Deletion failed: {str(e)}")

@router.post("/analyze-speech")
async def analyze_speech_patterns(sample_ids: List[str]):
    try:
        analysis = voice_training_service.analyze_speech_patterns(sample_ids)
        return {"success": True, "analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")