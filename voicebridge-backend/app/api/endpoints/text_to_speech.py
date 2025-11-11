from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from app.services.elevenlabs_service import elevenlabs_service

router = APIRouter()

class TTSRequest(BaseModel):
    text: str
    voice_id: str = None
    stability: float = 0.5
    similarity: float = 0.75
    style: float = 0.0
    speaker_boost: bool = True

@router.post("/text-to-speech")
async def text_to_speech(request: TTSRequest):
    try:
        audio_data = elevenlabs_service.text_to_speech(
            text=request.text,
            voice_id=request.voice_id,
            stability=request.stability,
            similarity_boost=request.similarity,
            style=request.style,
            use_speaker_boost=request.speaker_boost
        )
        
        return Response(
            content=audio_data,
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=speech.mp3"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")

@router.get("/voices")
async def get_voices():
    try:
        voices = elevenlabs_service.get_voices()
        return {"success": True, "voices": voices}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get voices: {str(e)}")