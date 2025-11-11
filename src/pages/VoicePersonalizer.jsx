// src/pages/VoicePersonalizer.jsx
import { useState, useRef, useEffect } from "react";
import { 
  Mic, 
  Save, 
  Play, 
  Trash2, 
  User, 
  Settings, 
  Upload, 
  Volume2,
  Award,
  Target,
  BarChart3,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Heart,
  Shield
} from "lucide-react";

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// API service functions
const voicePersonalizerAPI = {
  // Get training phrases optimized for non-standard speech
  async getTrainingPhrases() {
    const response = await fetch(`${API_BASE_URL}/api/voice/training-phrases`);
    if (!response.ok) throw new Error('Failed to fetch training phrases');
    return await response.json();
  },

  // Get user's voice profiles
  async getVoiceProfiles() {
    const response = await fetch(`${API_BASE_URL}/api/voice/profiles`);
    if (!response.ok) throw new Error('Failed to fetch voice profiles');
    const data = await response.json();
    return data.profiles || [];
  },

  // Upload voice sample with Whisper transcription
  async uploadVoiceSample(audioBlob, phrase, category, speechCharacteristics) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('phrase', phrase);
    formData.append('category', category);
    formData.append('speech_characteristics', JSON.stringify(speechCharacteristics));
    
    const response = await fetch(`${API_BASE_URL}/api/voice/upload-sample`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) throw new Error('Failed to upload voice sample');
    return await response.json();
  },

  // Get transcription using Whisper
  async transcribeAudio(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    
    const response = await fetch(`${API_BASE_URL}/api/voice/transcribe`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) throw new Error('Failed to transcribe audio');
    return await response.json();
  },

  // Delete voice sample
  async deleteVoiceSample(sampleId) {
    const response = await fetch(`${API_BASE_URL}/api/voice/samples/${sampleId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error('Failed to delete voice sample');
    return await response.json();
  },

  // Create voice profile with Eleven Labs
  async createVoiceProfile(profileData) {
    const response = await fetch(`${API_BASE_URL}/api/voice/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    if (!response.ok) throw new Error('Failed to create voice profile');
    return await response.json();
  },

  // Train voice model with Eleven Labs
  async trainVoiceModel(profileId, samples) {
    const response = await fetch(`${API_BASE_URL}/api/voice/profiles/${profileId}/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ samples }),
    });
    
    if (!response.ok) throw new Error('Failed to train voice model');
    return await response.json();
  },

  // Activate a voice profile
  async activateVoiceProfile(profileId) {
    const response = await fetch(`${API_BASE_URL}/api/voice/profiles/${profileId}/activate`, {
      method: 'POST',
    });
    
    if (!response.ok) throw new Error('Failed to activate voice profile');
    return await response.json();
  },

  // Delete a voice profile
  async deleteVoiceProfile(profileId) {
    const response = await fetch(`${API_BASE_URL}/api/voice/profiles/${profileId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error('Failed to delete voice profile');
    return await response.json();
  },

  // Test voice synthesis with Eleven Labs
  async testVoiceSynthesis(text, profileId) {
    const response = await fetch(`${API_BASE_URL}/api/voice/synthesize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        profile_id: profileId,
      }),
    });
    
    if (!response.ok) throw new Error('Failed to synthesize voice');
    return await response.blob();
  },

  // Analyze speech patterns
  async analyzeSpeechPatterns(sampleIds) {
    const response = await fetch(`${API_BASE_URL}/api/voice/analyze-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sample_ids: sampleIds }),
    });
    
    if (!response.ok) throw new Error('Failed to analyze speech patterns');
    return await response.json();
  }
};

export default function VoicePersonalizer() {
  // Core states
  const [currentStep, setCurrentStep] = useState(1);
  const [samples, setSamples] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSample, setActiveSample] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);
  
  // Voice profile states
  const [voiceName, setVoiceName] = useState("");
  const [tone, setTone] = useState("neutral");
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const [stability, setStability] = useState(0.5);
  const [similarity, setSimilarity] = useState(0.5);
  
  // Speech characteristics for non-standard speech
  const [speechCharacteristics, setSpeechCharacteristics] = useState({
    articulation_clarity: "medium",
    speech_rate: "medium",
    volume_consistency: "medium",
    has_apraxia: false,
    has_dysarthria: false,
    has_stutter: false,
    uses_aac: false,
    specific_challenges: []
  });

  // User profiles
  const [userProfiles, setUserProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  
  // Training phrases from backend
  const [trainingPhrases, setTrainingPhrases] = useState({});
  const [speechAnalysis, setSpeechAnalysis] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Voice tones optimized for non-standard speech
  const tones = [
    { id: "neutral", name: "Neutral", description: "Clear and balanced", icon: "🎯" },
    { id: "patient", name: "Patient", description: "Slow and clear pacing", icon: "❤️" },
    { id: "clear", name: "Very Clear", description: "Enhanced articulation", icon: "🔊" },
    { id: "calm", name: "Calm", description: "Relaxed and soothing", icon: "🌊" },
    { id: "friendly", name: "Friendly", description: "Warm and approachable", icon: "😊" }
  ];

  // Speech characteristics options
  const speechOptions = {
    clarity: [
      { id: "low", name: "Needs clearer articulation" },
      { id: "medium", name: "Moderate clarity" },
      { id: "high", name: "Clear articulation" }
    ],
    rate: [
      { id: "slow", name: "Slower speech" },
      { id: "medium", name: "Moderate pace" },
      { id: "fast", name: "Faster speech" }
    ],
    volume: [
      { id: "low", name: "Softer volume" },
      { id: "medium", name: "Moderate volume" },
      { id: "high", name: "Louder volume" }
    ]
  };

  // Load training phrases and profiles on component mount
  useEffect(() => {
    testBackendConnection();
    loadTrainingPhrases();
    loadVoiceProfiles();
  }, []);

  const testBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      const data = await response.json();
      setBackendConnected(true);
    } catch (error) {
      console.error('Backend connection failed:', error);
      setBackendConnected(false);
    }
  };

  const loadTrainingPhrases = async () => {
    try {
      const phrases = await voicePersonalizerAPI.getTrainingPhrases();
      setTrainingPhrases(phrases);
    } catch (error) {
      console.error("Failed to load training phrases:", error);
      setTrainingPhrases({});
    }
  };

  const loadVoiceProfiles = async () => {
    try {
      const profiles = await voicePersonalizerAPI.getVoiceProfiles();
      setUserProfiles(profiles);
      const active = profiles.find(p => p.isActive);
      setActiveProfile(active);
    } catch (error) {
      console.error("Failed to load voice profiles:", error);
      setUserProfiles([]);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          sampleRate: 22050,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true 
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Get current phrase
          const categories = Object.keys(trainingPhrases);
          if (categories.length === 0) {
            throw new Error("No training phrases available");
          }
          
          const currentCategory = categories[Math.floor(samples.length / 5) % categories.length];
          const phrases = trainingPhrases[currentCategory] || [];
          const currentPhrase = phrases[samples.length % phrases.length];
          
          if (!currentPhrase) {
            throw new Error("No phrase available for recording");
          }

          // Upload to backend with speech characteristics
          const result = await voicePersonalizerAPI.uploadVoiceSample(
            audioBlob,
            currentPhrase,
            currentCategory,
            speechCharacteristics
          );

          const newSample = {
            id: result.sample_id,
            phrase: currentPhrase,
            audioUrl: URL.createObjectURL(audioBlob),
            duration: result.duration,
            date: new Date().toISOString(),
            category: currentCategory,
            status: "processed",
            accuracy: result.accuracy,
            transcription: result.transcription,
            confidence: result.confidence
          };
          
          setSamples(prev => [...prev, newSample]);
          
          // Analyze speech patterns after collecting samples
          if (samples.length >= 3) {
            analyzeSpeechPatterns();
          }
          
        } catch (error) {
          console.error("Failed to process recording:", error);
          alert(`Recording failed: ${error.message}`);
        } finally {
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Auto-stop after 10 seconds to allow for non-standard speech patterns
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 10000);
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const analyzeSpeechPatterns = async () => {
    try {
      const sampleIds = samples.map(s => s.id);
      const analysis = await voicePersonalizerAPI.analyzeSpeechPatterns(sampleIds);
      setSpeechAnalysis(analysis);
    } catch (error) {
      console.error("Failed to analyze speech patterns:", error);
    }
  };

  const playSample = async (sampleId) => {
    const sample = samples.find(s => s.id === sampleId);
    if (sample && sample.audioUrl) {
      setActiveSample(sampleId);
      try {
        const audio = new Audio(sample.audioUrl);
        await audio.play();
        audio.onended = () => setActiveSample(null);
      } catch (error) {
        console.error("Failed to play audio:", error);
        setActiveSample(null);
      }
    }
  };

  const deleteSample = async (sampleId) => {
    try {
      await voicePersonalizerAPI.deleteVoiceSample(sampleId);
      setSamples(samples.filter(sample => sample.id !== sampleId));
    } catch (error) {
      console.error("Failed to delete sample:", error);
      alert("Failed to delete sample");
    }
  };

  const calculateProgress = () => {
    const totalRecommended = 25; // More samples for non-standard speech
    return Math.min((samples.length / totalRecommended) * 100, 100);
  };

  const getAccuracyLevel = (accuracy) => {
    if (accuracy >= 90) return { color: "text-green-600", label: "Excellent" };
    if (accuracy >= 75) return { color: "text-blue-600", label: "Good" };
    if (accuracy >= 60) return { color: "text-yellow-600", label: "Fair" };
    return { color: "text-red-600", label: "Needs Work" };
  };

  const saveVoiceProfile = async () => {
    if (samples.length < 10) {
      alert("Please record at least 10 voice samples for better personalization with non-standard speech");
      return;
    }
    
    if (!voiceName.trim()) {
      alert("Please give your custom voice a name");
      return;
    }

    setIsProcessing(true);
    
    try {
      const profileData = {
        name: voiceName,
        tone: tone,
        speaking_rate: speakingRate,
        stability: stability,
        similarity: similarity,
        speech_characteristics: speechCharacteristics,
        sample_ids: samples.map(s => s.id)
      };

      const result = await voicePersonalizerAPI.createVoiceProfile(profileData);
      
      if (result.success) {
        // Train the model with Eleven Labs
        const trainingResult = await voicePersonalizerAPI.trainVoiceModel(
          result.profile_id, 
          samples
        );
        
        if (trainingResult.success) {
          await loadVoiceProfiles();
          alert(`✅ Voice profile "${voiceName}" created successfully!`);
          setCurrentStep(4);
          setSamples([]);
          setVoiceName("");
        } else {
          alert("Voice profile created but training failed. Please try again.");
        }
      } else {
        alert("Failed to create voice profile. Please try again.");
      }
    } catch (error) {
      console.error("Failed to save voice profile:", error);
      alert("Failed to create voice profile. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const activateProfile = async (profileId) => {
    try {
      const result = await voicePersonalizerAPI.activateVoiceProfile(profileId);
      if (result.success) {
        await loadVoiceProfiles();
      } else {
        alert("Failed to activate profile");
      }
    } catch (error) {
      console.error("Failed to activate profile:", error);
      alert("Failed to activate profile");
    }
  };

  const deleteProfile = async (profileId) => {
    if (window.confirm("Are you sure you want to delete this voice profile?")) {
      try {
        const result = await voicePersonalizerAPI.deleteVoiceProfile(profileId);
        if (result.success) {
          await loadVoiceProfiles();
        } else {
          alert("Failed to delete profile");
        }
      } catch (error) {
        console.error("Failed to delete profile:", error);
        alert("Failed to delete profile");
      }
    }
  };

  const testVoiceSynthesis = async () => {
    if (!activeProfile) {
      alert("Please activate a voice profile first");
      return;
    }

    try {
      const testText = "Hello, this is a test of your personalized voice. How does it sound?";
      const audioBlob = await voicePersonalizerAPI.testVoiceSynthesis(testText, activeProfile.id);
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      console.error("Failed to test voice synthesis:", error);
      alert("Failed to test voice synthesis");
    }
  };

  const progress = calculateProgress();
  const categories = Object.keys(trainingPhrases);
  const currentCategory = categories[Math.floor(samples.length / 5) % categories.length] || "";
  const currentPhrases = trainingPhrases[currentCategory] || [];
  const currentPhrase = currentPhrases[samples.length % currentPhrases.length] || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950 pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            🎙️ Voice Personalizer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Create your unique digital voice using AI - Optimized for non-standard speech patterns
          </p>
          
          {/* Backend Connection Status */}
          <div className={`mt-4 text-sm font-medium ${backendConnected ? 'text-green-600' : 'text-red-600'}`}>
            {backendConnected ? '✅ Backend Connected (Using Eleven Labs + Whisper)' : '❌ Backend Disconnected'}
          </div>
          
          {/* Test Synthesis Button */}
          {activeProfile && (
            <div className="mt-4">
              <button
                onClick={testVoiceSynthesis}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2 mx-auto"
              >
                <Volume2 className="w-5 h-5" />
                Test Voice Synthesis
              </button>
            </div>
          )}
        </div>

        <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8">
          
          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 font-semibold transition-all ${
                    currentStep >= step 
                      ? "bg-purple-600 border-purple-600 text-white shadow-lg" 
                      : "border-gray-300 dark:border-gray-600 text-gray-500"
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-16 h-1 mx-2 ${
                      currentStep > step ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-600"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Record Samples */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">🎤 Record Voice Samples</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Record different phrases to train your personal voice model (10-25 recommended for best results)
                </p>
                
                {/* Speech Characteristics */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800 mb-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-blue-600" />
                    Speech Characteristics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="block font-medium mb-2">Articulation Clarity</label>
                      <select
                        value={speechCharacteristics.articulation_clarity}
                        onChange={(e) => setSpeechCharacteristics(prev => ({
                          ...prev,
                          articulation_clarity: e.target.value
                        }))}
                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                      >
                        {speechOptions.clarity.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-2">Speech Rate</label>
                      <select
                        value={speechCharacteristics.speech_rate}
                        onChange={(e) => setSpeechCharacteristics(prev => ({
                          ...prev,
                          speech_rate: e.target.value
                        }))}
                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                      >
                        {speechOptions.rate.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium mb-2">Volume Consistency</label>
                      <select
                        value={speechCharacteristics.volume_consistency}
                        onChange={(e) => setSpeechCharacteristics(prev => ({
                          ...prev,
                          volume_consistency: e.target.value
                        }))}
                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                      >
                        {speechOptions.volume.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Progress Overview */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{samples.length}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Samples</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Progress</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {samples.length > 0 ? Math.round(samples.reduce((acc, s) => acc + s.confidence, 0) / samples.length) : 0}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avg Confidence</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600 capitalize">{currentCategory}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Current Category</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Training Progress</span>
                      <span>{samples.length}/25 samples</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Recording Interface */}
                <div className="space-y-4">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      disabled={isProcessing || !backendConnected || !currentPhrase}
                      className="px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl font-bold text-lg shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <Mic className="w-8 h-8 inline-block mr-3" />
                      {isProcessing ? "Processing..." : "Start Recording"}
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-center space-x-2">
                        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                          <div 
                            key={i}
                            className="w-3 h-12 bg-gradient-to-t from-purple-500 to-pink-500 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          />
                        ))}
                      </div>
                      <button
                        onClick={stopRecording}
                        className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all"
                      >
                        Stop Recording
                      </button>
                    </div>
                  )}

                  {/* Current Phrase */}
                  {!isRecording && !isProcessing && currentPhrase && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
                      <div className="text-sm text-blue-600 dark:text-blue-400 mb-2 font-semibold">
                        Current Category: {currentCategory.toUpperCase()}
                      </div>
                      <p className="text-lg font-medium text-blue-800 dark:text-blue-300">
                        "{currentPhrase}"
                      </p>
                    </div>
                  )}

                  {!backendConnected && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border-2 border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="w-5 h-5" />
                        Backend connection required for voice personalization
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recorded Samples */}
              {samples.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-purple-600" />
                    Your Recorded Samples
                  </h3>
                  <div className="grid gap-4">
                    {samples.map((sample, index) => {
                      const accuracyInfo = getAccuracyLevel(sample.confidence);
                      return (
                        <div key={sample.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-10 h-10 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400 font-semibold">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <p className="font-medium text-gray-800 dark:text-gray-200">{sample.phrase}</p>
                                  <span className={`text-xs px-2 py-1 rounded-full ${accuracyInfo.color} bg-opacity-20`}>
                                    {sample.confidence}%
                                  </span>
                                </div>
                                {sample.transcription && (
                                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Heard: "{sample.transcription}"
                                  </div>
                                )}
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                  <span>{sample.duration}</span>
                                  <span>•</span>
                                  <span>{new Date(sample.date).toLocaleDateString()}</span>
                                  <span>•</span>
                                  <span className="capitalize">{sample.category}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => playSample(sample.id)}
                                disabled={activeSample === sample.id}
                                className="p-2 bg-green-500 hover:bg-green-600 rounded-lg text-white transition disabled:opacity-50"
                                title="Play sample"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteSample(sample.id)}
                                className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition"
                                title="Delete sample"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Next Button */}
              {samples.length >= 10 && (
                <div className="text-center mt-8">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl font-semibold text-lg transition-all transform hover:scale-105"
                  >
                    Continue to Voice Settings →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Voice Settings */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  <Settings className="w-6 h-6 inline mr-2" />
                  Voice Characteristics
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Customize how your personalized voice will sound
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Tone Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Voice Tone</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {tones.map((toneOption) => (
                      <button
                        key={toneOption.id}
                        onClick={() => setTone(toneOption.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          tone === toneOption.id
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg"
                            : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
                        }`}
                      >
                        <div className="text-2xl mb-2">{toneOption.icon}</div>
                        <div className="font-semibold">{toneOption.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{toneOption.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Eleven Labs Settings */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Voice Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Stability: {stability.toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={stability}
                          onChange={(e) => setStability(parseFloat(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span>More variable</span>
                          <span>More stable</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Similarity: {similarity.toFixed(2)}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={similarity}
                          onChange={(e) => setSimilarity(parseFloat(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span>More creative</span>
                          <span>More similar</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Speech Analysis Results */}
              {speechAnalysis && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Speech Pattern Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {speechAnalysis.articulation_score}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Articulation</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {speechAnalysis.consistency_score}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Consistency</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {speechAnalysis.overall_score}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Overall Quality</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  ← Back to Recording
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all"
                >
                  Continue to Profile Setup →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Profile Setup */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">
                  <User className="w-6 h-6 inline mr-2" />
                  Profile Setup
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Finalize your voice profile settings
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Information */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Voice Profile Name</label>
                    <input
                      type="text"
                      value={voiceName}
                      onChange={(e) => setVoiceName(e.target.value)}
                      placeholder="e.g., My Personal Voice, Professional Tone, etc."
                      className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                  </div>

                  {/* Profile Summary */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800">
                    <h3 className="font-semibold mb-4">Profile Summary</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Samples Recorded:</span>
                        <span className="font-semibold">{samples.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Selected Tone:</span>
                        <span className="font-semibold capitalize">{tones.find(t => t.id === tone)?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Stability:</span>
                        <span className="font-semibold">{stability.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Similarity:</span>
                        <span className="font-semibold">{similarity.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Existing Profiles */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Your Voice Profiles</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {userProfiles.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No voice profiles created yet
                      </div>
                    ) : (
                      userProfiles.map((profile) => (
                        <div
                          key={profile.id}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            profile.isActive
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-semibold">{profile.name}</div>
                            {profile.isActive && (
                              <div className="flex items-center gap-1 text-green-600 text-sm">
                                <CheckCircle2 className="w-4 h-4" />
                                Active
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <div>{profile.samples} samples</div>
                            <div>{profile.quality_score}% quality</div>
                            <div className="capitalize">{profile.tone} tone</div>
                            <div>{new Date(profile.created).toLocaleDateString()}</div>
                          </div>
                          <div className="flex gap-2">
                            {!profile.isActive && (
                              <button
                                onClick={() => activateProfile(profile.id)}
                                className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition"
                              >
                                Activate
                              </button>
                            )}
                            <button
                              onClick={() => deleteProfile(profile.id)}
                              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={saveVoiceProfile}
                disabled={isProcessing || !voiceName.trim() || !backendConnected}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-lg transition-all ${
                  isProcessing
                    ? "bg-purple-500/50 cursor-wait"
                    : !voiceName.trim() || !backendConnected
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:scale-105"
                } text-white shadow-2xl`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Creating Your Voice Profile...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    Save Voice Profile
                  </>
                )}
              </button>

              <button
                onClick={() => setCurrentStep(2)}
                className="w-full py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                ← Back to Voice Settings
              </button>
            </div>
          )}

          {/* Step 4: Training Complete */}
          {currentStep === 4 && (
            <div className="text-center space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl p-8 border-2 border-green-200 dark:border-green-800">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold mb-2 text-green-600">Voice Profile Ready!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your personalized voice profile has been successfully created with Eleven Labs and is ready to use.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-purple-600">{samples.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Training Samples</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-blue-600">
                      {samples.length > 0 ? Math.round(samples.reduce((acc, s) => acc + s.confidence, 0) / samples.length) : 0}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg Confidence</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-green-600 capitalize">{tones.find(t => t.id === tone)?.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Voice Tone</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 justify-center">
                  <button
                    onClick={() => window.location.href = '/speech-lab'}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all"
                  >
                    Try in Speech Lab
                  </button>
                  <button
                    onClick={() => {
                      setCurrentStep(1);
                      setSamples([]);
                      setVoiceName("");
                    }}
                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Create Another Profile
                  </button>
                  <button
                    onClick={testVoiceSynthesis}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
                  >
                    <Volume2 className="w-5 h-5" />
                    Test Voice
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}