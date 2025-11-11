from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.whisper_service import whisper_service
from app.services.huggingface_service import huggingface_service
import os
from app.core.config import settings

router = APIRouter()

@router.post("/speech-to-text")
async def speech_to_text(
    file: UploadFile = File(...),
    language: str = Form("en"),
    use_non_standard_model: bool = Form(False)
):
    try:
        # Save uploaded file
        file_location = f"data/temp/{file.filename}"
        os.makedirs(os.path.dirname(file_location), exist_ok=True)
        
        with open(file_location, "wb") as f:
            f.write(await file.read())
        
        # Choose transcription service
        if use_non_standard_model:
            result = huggingface_service.transcribe_non_standard_speech(file_location, language)
        else:
            result = whisper_service.transcribe_audio(file_location, language)
        
        # Clean up
        os.unlink(file_location)
        
        return {
            "success": True,
            "text": result["text"],
            "language": result["language"],
            "confidence": result.get("confidence", 0.0),
            "full_transcription": result.get("full_transcription", ""),
            "segments": result.get("segments", [])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

@router.post("/voice/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = Form("en")
):
    try:
        audio_bytes = await file.read()
        result = whisper_service.transcribe_audio_bytes(audio_bytes, language)
        
        return {
            "success": True,
            "text": result["text"],
            "language": result["language"],
            "confidence": result["confidence"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")