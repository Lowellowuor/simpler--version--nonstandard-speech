// Vite uses import.meta.env instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      // Handle different response types
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else if (contentType && contentType.includes('audio/')) {
        return await response.blob();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Speech-to-Text methods
  async transcribeAudio(formData) {
    return this.request('/api/speech-to-text', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type for FormData, let browser set it
      headers: {},
    });
  }

  async transcribeAudioFile(file, language = 'en', useNonStandardModel = false) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    formData.append('use_non_standard_model', useNonStandardModel.toString());
    
    return this.transcribeAudio(formData);
  }

  // Text-to-Speech methods
  async textToSpeech(text, voiceId = null, settings = {}) {
    const response = await fetch(`${this.baseURL}/api/text-to-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice_id: voiceId,
        ...settings,
      }),
    });

    if (!response.ok) {
      throw new Error(`TTS failed: ${response.status}`);
    }

    return await response.blob();
  }

  // Voice Profile methods
  async getVoiceProfiles() {
    return this.request('/api/voice/profiles');
  }

  async createVoiceProfile(profileData) {
    return this.request('/api/voice/profiles', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async uploadVoiceSample(profileId, audioFile, phrase, characteristics = {}) {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('phrase', phrase);
    formData.append('profile_id', profileId);
    formData.append('speech_characteristics', JSON.stringify(characteristics));
    formData.append('category', 'general');

    return this.request('/api/voice/upload-sample', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async trainVoiceModel(profileId) {
    return this.request(`/api/voice/profiles/${profileId}/train`, {
      method: 'POST',
    });
  }

  async activateVoiceProfile(profileId) {
    return this.request(`/api/voice/profiles/${profileId}/activate`, {
      method: 'POST',
    });
  }

  async deleteVoiceProfile(profileId) {
    return this.request(`/api/voice/profiles/${profileId}`, {
      method: 'DELETE',
    });
  }

  async deleteVoiceSample(sampleId) {
    return this.request(`/api/voice/samples/${sampleId}`, {
      method: 'DELETE',
    });
  }

  async analyzeSpeechPatterns(sampleIds) {
    return this.request('/api/voice/analyze-speech', {
      method: 'POST',
      body: JSON.stringify({ sample_ids: sampleIds }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/api/health');
  }

  // Get training phrases
  async getTrainingPhrases() {
    return this.request('/api/voice/training-phrases');
  }

  // Get available voices from ElevenLabs
  async getAvailableVoices() {
    return this.request('/api/voices');
  }
}

export default new ApiService();