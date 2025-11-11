import requests
import io
from typing import Optional, Dict, Any
from app.core.config import settings

class ElevenLabsService:
    def __init__(self):
        self.api_key = settings.ELEVENLABS_API_KEY
        self.base_url = "https://api.elevenlabs.io/v1"
        self.headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json"
        }
    
    def text_to_speech(self, text: str, voice_id: str = None, 
                      stability: float = 0.5, similarity_boost: float = 0.75,
                      style: float = 0.0, use_speaker_boost: bool = True) -> bytes:
        """Convert text to speech using Eleven Labs"""
        try:
            voice_id = voice_id or settings.ELEVENLABS_VOICE_ID
            
            url = f"{self.base_url}/text-to-speech/{voice_id}"
            
            data = {
                "text": text,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {
                    "stability": stability,
                    "similarity_boost": similarity_boost,
                    "style": style,
                    "use_speaker_boost": use_speaker_boost
                }
            }
            
            response = requests.post(url, json=data, headers=self.headers)
            
            if response.status_code == 200:
                return response.content
            else:
                error_msg = f"Eleven Labs API error: {response.status_code} - {response.text}"
                print(error_msg)
                raise Exception(error_msg)
                
        except Exception as e:
            print(f"TTS error: {e}")
            raise
    
    def get_voices(self) -> list:
        """Get available voices from Eleven Labs"""
        try:
            url = f"{self.base_url}/voices"
            response = requests.get(url, headers=self.headers)
            
            if response.status_code == 200:
                return response.json().get("voices", [])
            else:
                raise Exception(f"Failed to get voices: {response.status_code}")
                
        except Exception as e:
            print(f"Error getting voices: {e}")
            return []
    
    def create_voice(self, name: str, description: str, files: list) -> Dict[str, Any]:
        """Create a custom voice from samples"""
        try:
            url = f"{self.base_url}/voices/add"
            
            data = {
                "name": name,
                "description": description,
            }
            
            files_data = []
            for file in files:
                files_data.append(("files", (file.filename, file.file, "audio/mpeg")))
            
            response = requests.post(url, data=data, files=files_data, headers={
                "xi-api-key": self.api_key
            })
            
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Failed to create voice: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"Error creating voice: {e}")
            raise

# Global instance
elevenlabs_service = ElevenLabsService()