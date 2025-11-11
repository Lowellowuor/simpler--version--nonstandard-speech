import whisper
import torch
import numpy as np
from typing import Dict, Any, Optional
import tempfile
import os
from app.core.config import settings

class WhisperService:
    def __init__(self):
        self.model = None
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.load_model()
    
    def load_model(self):
        """Load Whisper model"""
        try:
            self.model = whisper.load_model(settings.WHISPER_MODEL, device=self.device)
            print(f"Loaded Whisper model {settings.WHISPER_MODEL} on {self.device}")
        except Exception as e:
            print(f"Error loading Whisper model: {e}")
            # Fallback to CPU if CUDA not available
            if "cuda" in str(e).lower():
                print("Falling back to CPU...")
                self.device = "cpu"
                self.model = whisper.load_model(settings.WHISPER_MODEL, device="cpu")
            else:
                raise
    
    def transcribe_audio(self, audio_path: str, language: str = "en") -> Dict[str, Any]:
        """Transcribe audio file using Whisper"""
        try:
            if not self.model:
                self.load_model()
            
            # Use Whisper's built-in transcribe method
            result = self.model.transcribe(
                audio_path, 
                language=language,
                fp16=False  # Use FP32 for better compatibility
            )
            
            # Calculate confidence from logprobs if available
            confidence = 0.0
            if result.get("segments"):
                confidences = [seg.get("avg_logprob", 0) for seg in result["segments"]]
                if confidences:
                    confidence = np.mean(confidences)
                    # Convert log probability to confidence score (0-1)
                    confidence = min(1.0, max(0.0, (confidence + 10) / 10))
            
            return {
                "text": result["text"].strip(),
                "language": language,
                "confidence": confidence,
                "full_transcription": result["text"].strip(),
                "segments": result.get("segments", [])
            }
            
        except Exception as e:
            print(f"Transcription error: {e}")
            raise
    
    def transcribe_audio_bytes(self, audio_bytes: bytes, language: str = "en") -> Dict[str, Any]:
        """Transcribe audio from bytes"""
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
                temp_file.write(audio_bytes)
                temp_file.flush()
                result = self.transcribe_audio(temp_file.name, language)
            
            # Clean up
            os.unlink(temp_file.name)
            return result
            
        except Exception as e:
            print(f"Transcription from bytes error: {e}")
            raise

# Global instance
whisper_service = WhisperService()