// src/pages/SpeechLab.jsx
import { useState, useRef, useEffect } from "react";
import { 
  Mic, 
  Volume2, 
  Copy, 
  Download, 
  Play, 
  Square, 
  Upload, 
  Loader2, 
  Settings,
  Share,
  History,
  Bookmark,
  Languages,
  Pause,
  Trash2,
  Clock
} from "lucide-react";

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// History management functions
const saveSTTHistory = (transcribedText, accuracy, language, duration) => {
  const historyItem = {
    content: transcribedText,
    accuracy: accuracy,
    language: language,
    duration: duration,
    timestamp: new Date().toISOString(),
    type: 'stt'
  };
  
  // Save to localStorage (or send to backend)
  const existing = JSON.parse(localStorage.getItem('speechLab_stt_history') || '[]');
  const updated = [historyItem, ...existing.slice(0, 49)]; // Keep last 50
  localStorage.setItem('speechLab_stt_history', JSON.stringify(updated));
  return historyItem;
};

const saveTTSHistory = (text, voiceModel, language, duration) => {
  const historyItem = {
    content: text,
    voiceModel: voiceModel,
    language: language,
    duration: duration,
    timestamp: new Date().toISOString(),
    type: 'tts'
  };
  
  const existing = JSON.parse(localStorage.getItem('speechLab_tts_history') || '[]');
  const updated = [historyItem, ...existing.slice(0, 49)];
  localStorage.setItem('speechLab_tts_history', JSON.stringify(updated));
  return historyItem;
};

export default function SpeechLab() {
  // Core states
  const [mode, setMode] = useState("stt"); // 'tts' or 'stt'
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [showLiveSection, setShowLiveSection] = useState(false);
  const [isLiveTranscribing, setIsLiveTranscribing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [liveSessionText, setLiveSessionText] = useState("");
  const [backendConnected, setBackendConnected] = useState(false);
  
  // Settings states
  const [showSettings, setShowSettings] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [voiceModel, setVoiceModel] = useState("default");
  
  // History states
  const [showHistory, setShowHistory] = useState(false);
  const [sttHistory, setSttHistory] = useState([]);
  const [ttsHistory, setTtsHistory] = useState([]);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);

  // Quick phrases for common communication
  const quickPhrases = [
    "Hello, how are you today?",
    "I need some help please",
    "I'm not feeling very well",
    "Thank you for your assistance",
    "Can you please repeat that?",
    "I don't understand what you said",
    "Where is the nearest bathroom?",
    "I'm feeling hungry right now",
    "Could I have some water please?",
    "What time is our appointment?",
    "I want to go home now",
    "This is important to me"
  ];

  // Language options
  const languages = [
    { code: "en-US", name: "English (US)", flag: "🇺🇸" },
    { code: "en-GB", name: "English (UK)", flag: "🇬🇧" },
    { code: "sw-KE", name: "Swahili (Kenya)", flag: "🇰🇪" },
    { code: "es-ES", name: "Spanish", flag: "🇪🇸" },
    { code: "fr-FR", name: "French", flag: "🇫🇷" }
  ];

  // Voice models
  const voiceModels = [
    { id: "default", name: "Standard Voice" },
    { id: "personalized", name: "My Personalized Voice" },
    { id: "warm", name: "Warm Tone" },
    { id: "professional", name: "Professional" },
    { id: "friendly", name: "Friendly" }
  ];

  // Check backend connection on component mount and load history
  useEffect(() => {
    testBackendConnection();
    loadHistory();
  }, []);

  // Load history from localStorage
  const loadHistory = () => {
    try {
      const stt = JSON.parse(localStorage.getItem('speechLab_stt_history') || '[]');
      const tts = JSON.parse(localStorage.getItem('speechLab_tts_history') || '[]');
      setSttHistory(stt);
      setTtsHistory(tts);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  // Clear all history
  const clearHistory = (type = 'all') => {
    if (type === 'stt' || type === 'all') {
      localStorage.removeItem('speechLab_stt_history');
      setSttHistory([]);
    }
    if (type === 'tts' || type === 'all') {
      localStorage.removeItem('speechLab_tts_history');
      setTtsHistory([]);
    }
  };

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      const data = await response.json();
      setBackendConnected(true);
      console.log('Backend connection:', data);
      return true;
    } catch (error) {
      console.error('Backend connection failed:', error);
      setBackendConnected(false);
      return false;
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setTranscribedText(prev => prev + ' ' + finalTranscript);
          setLiveSessionText(prev => prev + ' ' + finalTranscript);
          setInterimTranscript('');
        } else {
          setInterimTranscript(interimTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsLiveTranscribing(false);
      };

      recognitionRef.current.onend = () => {
        if (isLiveTranscribing) {
          // Restart recognition if we're still in live mode
          recognitionRef.current.start();
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);

  // Update recognition language when changed
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  // Backend Text-to-Speech
  const handleBackendTTS = async (textToSpeak) => {
    if (!backendConnected) {
      alert("Backend not connected. Using browser TTS as fallback.");
      await realTextToSpeech(textToSpeak);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToSpeak,
          language: language,
          voice_model: voiceModel,
          speed: playbackSpeed,
        }),
      });
      
      if (!response.ok) throw new Error('TTS failed');
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.play();
      setIsPlaying(true);
      
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
    } catch (error) {
      console.error('Backend TTS error:', error);
      // Fallback to browser TTS
      await realTextToSpeech(textToSpeak);
    }
  };

  // Browser fallback text-to-speech
  const realTextToSpeech = (text) => {
    return new Promise((resolve, reject) => {
      if ('speechSynthesis' in window) {
        // Stop any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = playbackSpeed;
        
        // Configure voice based on selected model
        const voices = window.speechSynthesis.getVoices();
        const selectedVoice = voices.find(voice => 
          voice.lang === language && 
          voice.name.toLowerCase().includes(voiceModel === 'warm' ? 'warm' : 
                                          voiceModel === 'professional' ? 'professional' :
                                          voiceModel === 'friendly' ? 'friendly' : '')
        );
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }

        utterance.onend = () => {
          setIsPlaying(false);
          setIsPaused(false);
          resolve("speech_completed");
        };

        utterance.onerror = (event) => {
          reject(new Error('Speech synthesis failed: ' + event.error));
        };

        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
        setIsPaused(false);
        resolve("speech_started");
      } else {
        reject(new Error("Speech synthesis not supported"));
      }
    });
  };

  // Backend Speech-to-Text (updated to save history)
  const processRecordingWithBackend = async () => {
    if (!backendConnected) {
      alert("Backend not connected. Using browser speech recognition as fallback.");
      await processRecordingWithSpeechAPI();
      return;
    }

    setIsLoading(true);
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.wav');
      formData.append('language', language);
      
      const response = await fetch(`${API_BASE_URL}/api/speech-to-text`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Transcription failed');
      
      const result = await response.json();
      setTranscribedText(result.text);
      
      // Save to history
      const duration = audioBlob.size / 16000; // Rough estimate
      const accuracy = result.confidence || 0.95; // Use actual confidence if available
      saveSTTHistory(result.text, accuracy, language, duration);
      loadHistory(); // Refresh history display
      
      // Automatically speak the transcribed text
      if (result.text.trim()) {
        await handleBackendTTS(result.text);
      }
      
    } catch (error) {
      console.error('Backend transcription error:', error);
      // Fallback to browser speech recognition
      await processRecordingWithSpeechAPI();
    } finally {
      setIsLoading(false);
    }
  };

  // Browser fallback speech recognition (updated to save history)
  const processRecordingWithSpeechAPI = () => {
    return new Promise((resolve) => {
      // Use the browser's speech recognition directly
      if (recognitionRef.current) {
        const originalContinuous = recognitionRef.current.continuous;
        const originalInterim = recognitionRef.current.interimResults;
        
        // Configure for single recognition
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setTranscribedText(transcript);
          
          // Save to history
          const duration = 5; // Estimate 5 seconds for browser recognition
          const accuracy = 0.90; // Estimated accuracy for browser recognition
          saveSTTHistory(transcript, accuracy, language, duration);
          loadHistory();
          
          // Automatically speak the transcribed text
          if (transcript.trim()) {
            realTextToSpeech(transcript);
          }
          
          // Restore original settings
          recognitionRef.current.continuous = originalContinuous;
          recognitionRef.current.interimResults = originalInterim;
          resolve();
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          // Restore original settings
          recognitionRef.current.continuous = originalContinuous;
          recognitionRef.current.interimResults = originalInterim;
          resolve();
        };

        recognitionRef.current.start();
      } else {
        resolve();
      }
    });
  };

  // Start recording for STT
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        if (backendConnected) {
          await processRecordingWithBackend();
        } else {
          await processRecordingWithSpeechAPI();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Auto-stop after 30 seconds for demo
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 30000);
      
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

  // Start live transcription
  const startLiveTranscription = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    try {
      recognitionRef.current.start();
      setIsLiveTranscribing(true);
      setTranscribedText("");
      setInterimTranscript("");
      setLiveSessionText("");
    } catch (error) {
      console.error("Error starting speech recognition:", error);
    }
  };

  // Stop live transcription
  const stopLiveTranscription = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsLiveTranscribing(false);
    }
  };

  // Handle text-to-speech conversion (updated to save history)
  const handleTextToSpeech = async () => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    try {
      if (backendConnected) {
        await handleBackendTTS(text);
      } else {
        await realTextToSpeech(text);
      }
      
      // Save to history
      const duration = text.length / 10; // Rough estimate: 10 chars per second
      saveTTSHistory(text, voiceModel, language, duration);
      loadHistory(); // Refresh history display
      
    } catch (error) {
      console.error("Text-to-speech error:", error);
      alert("Text-to-speech failed. Please try again.");
    }
    setIsLoading(false);
  };

  // Stop speech synthesis
  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  // Utility functions
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transcribedText || text || liveSessionText);
      alert("Text copied to clipboard!");
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const downloadText = () => {
    const content = transcribedText || text || liveSessionText;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speech-lab-${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareContent = async () => {
    const content = transcribedText || text || liveSessionText;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Speech Lab Output',
          text: content,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      copyToClipboard();
      alert("Content copied to clipboard for sharing!");
    }
  };

  const clearAll = () => {
    setText("");
    setTranscribedText("");
    setAudioFile(null);
    setIsPlaying(false);
    setIsPaused(false);
    setInterimTranscript("");
    setLiveSessionText("");
    if (isLiveTranscribing) {
      stopLiveTranscription();
    }
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      
      if (!backendConnected) {
        alert("Backend not connected. Please use microphone recording instead.");
        return;
      }

      setIsLoading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('language', language);
        
        const response = await fetch(`${API_BASE_URL}/api/speech-to-text`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) throw new Error('Transcription failed');
        
        const result = await response.json();
        setTranscribedText(result.text);
        
        // Save to history for uploaded files too
        const duration = file.size / 16000; // Rough estimate
        const accuracy = result.confidence || 0.95;
        saveSTTHistory(result.text, accuracy, language, duration);
        loadHistory();
        
      } catch (error) {
        console.error('File upload transcription error:', error);
        alert("File transcription failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Format duration for display
  const formatDuration = (seconds) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Format date for display
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Use history item
  const useHistoryItem = (item) => {
    if (item.type === 'stt') {
      setMode('stt');
      setTranscribedText(item.content);
    } else {
      setMode('tts');
      setText(item.content);
    }
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            🧠 Speech Lab
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Convert between speech and text with real microphone input
          </p>
          
          {/* Backend Connection Status */}
          <div className={`mt-4 text-sm font-medium ${backendConnected ? 'text-green-600' : 'text-red-600'}`}>
            {backendConnected ? '✅ Backend Connected (Using AI Models)' : '❌ Backend Disconnected (Using Browser Features)'}
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8">
          
          {/* Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="flex rounded-2xl bg-gray-100 dark:bg-gray-700 p-1">
              <button
                className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all ${
                  mode === "stt"
                    ? "bg-white dark:bg-gray-800 shadow-lg text-purple-600 dark:text-purple-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                onClick={() => setMode("stt")}
              >
                <Mic className="w-5 h-5" />
                Speech → Text
              </button>
              <button
                className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all ${
                  mode === "tts"
                    ? "bg-white dark:bg-gray-800 shadow-lg text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
                onClick={() => setMode("tts")}
              >
                <Volume2 className="w-5 h-5" />
                Text → Speech
              </button>
            </div>
          </div>

          {/* Quick Phrases */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Quick Phrases:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {quickPhrases.map((phrase, index) => (
                <button
                  key={index}
                  onClick={() => mode === "tts" ? setText(phrase) : null}
                  className="p-2 text-xs bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors truncate text-blue-800 dark:text-blue-300"
                  title={phrase}
                >
                  {phrase}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-6">
            {mode === "stt" ? (
              /* Speech to Text Mode */
              <div className="space-y-6">
                {/* Recording Controls */}
                <div className="text-center space-y-4">
                  {!isRecording && !isLiveTranscribing ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          onClick={startRecording}
                          disabled={isLoading}
                          className="px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl font-bold text-lg shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          <Mic className="w-8 h-8 inline-block mr-3" />
                          Start Recording
                        </button>
                        
                        <button
                          onClick={() => setShowLiveSection(true)}
                          className="px-8 py-6 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-2xl font-bold text-lg shadow-2xl transition-all transform hover:scale-105"
                        >
                          <Mic className="w-8 h-8 inline-block mr-3" />
                          Live Mode
                        </button>
                      </div>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {backendConnected ? "Upload audio file for AI transcription" : "Audio upload requires backend connection"}
                      </div>
                      
                      <div className="relative inline-block">
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioUpload}
                          className="hidden"
                          id="audio-upload"
                          disabled={!backendConnected}
                        />
                        <label
                          htmlFor="audio-upload"
                          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold cursor-pointer transition-all ${
                            backendConnected 
                              ? "bg-gray-600 hover:bg-gray-700 text-white" 
                              : "bg-gray-400 text-gray-200 cursor-not-allowed"
                          }`}
                        >
                          <Upload className="w-5 h-5" />
                          Upload Audio File
                        </label>
                      </div>
                    </div>
                  ) : isRecording ? (
                    <div className="space-y-4">
                      <div className="flex justify-center space-x-2">
                        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                          <div 
                            key={i}
                            className="w-3 h-12 bg-gradient-to-t from-purple-500 to-blue-500 rounded-full animate-bounce"
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
                      <p className="text-gray-600 dark:text-gray-400">
                        Speak now... {backendConnected ? "Using AI transcription" : "Using browser speech recognition"}
                      </p>
                    </div>
                  ) : null}
                </div>

                {/* Live Section */}
                {showLiveSection && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-green-800 dark:text-green-300 text-lg flex items-center gap-2">
                        <Mic className="w-5 h-5" />
                        Live Speech Recognition
                      </h3>
                      <button
                        onClick={() => setShowLiveSection(false)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Close
                      </button>
                    </div>
                    
                    {!isLiveTranscribing ? (
                      <div className="text-center space-y-4">
                        <button
                          onClick={startLiveTranscription}
                          className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all"
                        >
                          Start Live Transcription
                        </button>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Real-time speech recognition from your microphone
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-center space-x-2">
                          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                            <div 
                              key={i}
                              className="w-3 h-12 bg-gradient-to-t from-green-500 to-teal-500 rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 0.1}s` }}
                            />
                          ))}
                        </div>
                        
                        <div className="text-center">
                          <button
                            onClick={stopLiveTranscription}
                            className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all"
                          >
                            Stop Live Transcription
                          </button>
                        </div>

                        {/* Live Transcription Display */}
                        <div className="space-y-4">
                          {liveSessionText && (
                            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-green-200 dark:border-green-800">
                              <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                                {liveSessionText}
                              </p>
                            </div>
                          )}
                          
                          {interimTranscript && (
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
                              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed italic">
                                {interimTranscript}
                              </p>
                              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                                Listening...
                              </p>
                            </div>
                          )}
                          
                          {/* Action Buttons for Live Session */}
                          {liveSessionText && (
                            <div className="flex flex-wrap gap-3 justify-center">
                              <button
                                onClick={() => handleBackendTTS(liveSessionText)}
                                disabled={isPlaying}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-all"
                              >
                                <Play className="w-4 h-4" />
                                Speak This Text
                              </button>
                              <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                              >
                                <Copy className="w-4 h-4" />
                                Copy Text
                              </button>
                              <button
                                onClick={downloadText}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                              >
                                <Download className="w-4 h-4" />
                                Download
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* File Info */}
                {audioFile && !isRecording && !isLiveTranscribing && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 text-center">
                    <p className="text-purple-800 dark:text-purple-300">
                      📁 File selected: {audioFile.name}
                    </p>
                  </div>
                )}

                {/* Results Section */}
                {(transcribedText || isLoading) && !isLiveTranscribing && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Loader2 className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                      {isLoading ? "Processing your speech..." : "Transcription Result"}
                    </h3>
                    
                    {!isLoading && transcribedText && (
                      <div className="space-y-4">
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-green-200 dark:border-green-800">
                          <p className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
                            {transcribedText}
                          </p>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 justify-center">
                          <button
                            onClick={() => handleBackendTTS(transcribedText)}
                            disabled={isPlaying}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-all"
                          >
                            <Play className="w-4 h-4" />
                            Speak This Text
                          </button>
                          <button
                            onClick={copyToClipboard}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                          >
                            <Copy className="w-4 h-4" />
                            Copy Text
                          </button>
                          <button
                            onClick={downloadText}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                          <button
                            onClick={shareContent}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all"
                          >
                            <Share className="w-4 h-4" />
                            Share
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Text to Speech Mode */
              <div className="space-y-6">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-lg resize-none"
                  placeholder="Type your text here or use quick phrases above..."
                  rows="6"
                />
                
                <div className="flex flex-wrap gap-4 justify-center">
                  <button
                    onClick={handleTextToSpeech}
                    disabled={isLoading || !text.trim()}
                    className="flex-1 min-w-[200px] flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Generating Speech...
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-6 h-6" />
                        Convert to Speech
                      </>
                    )}
                  </button>

                  {isPlaying && (
                    <button
                      onClick={stopSpeech}
                      className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-semibold transition-all"
                    >
                      <Square className="w-6 h-6" />
                      Stop Speech
                    </button>
                  )}

                  <button
                    onClick={clearAll}
                    className="px-6 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Clear All
                  </button>
                </div>

                {/* Speech Status */}
                {isPlaying && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800 text-center">
                    <div className="flex justify-center space-x-2 mb-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div 
                          key={i}
                          className="w-3 h-8 bg-gradient-to-t from-green-500 to-teal-500 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                    <p className="text-green-800 dark:text-green-300 font-semibold">
                      Speaking your text...
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-4 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Settings & Preferences
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Language Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    <Languages className="w-4 h-4 inline mr-2" />
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Voice Model */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Voice Model
                  </label>
                  <select
                    value={voiceModel}
                    onChange={(e) => setVoiceModel(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    {voiceModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Playback Speed */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Playback Speed: {playbackSpeed}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span>Slower</span>
                    <span>Faster</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* History Panel */}
          {showHistory && (
            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <History className="w-5 h-5" />
                  History
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => clearHistory('stt')}
                    disabled={sttHistory.length === 0}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/50 disabled:opacity-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear STT
                  </button>
                  <button
                    onClick={() => clearHistory('tts')}
                    disabled={ttsHistory.length === 0}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/50 disabled:opacity-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear TTS
                  </button>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* STT History */}
                <div>
                  <h4 className="font-medium mb-3 text-purple-600 dark:text-purple-400 flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    Speech to Text History ({sttHistory.length})
                  </h4>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {sttHistory.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                        No speech to text history yet
                      </p>
                    ) : (
                      sttHistory.map((item, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all cursor-pointer"
                          onClick={() => useHistoryItem(item)}
                        >
                          <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 mb-2">
                            {item.content}
                          </p>
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatDate(item.timestamp)}</span>
                            <span>{formatDuration(item.duration)}</span>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-purple-600 dark:text-purple-400">
                              {item.language}
                            </span>
                            <span className="text-green-600 dark:text-green-400">
                              {Math.round(item.accuracy * 100)}% accuracy
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* TTS History */}
                <div>
                  <h4 className="font-medium mb-3 text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Text to Speech History ({ttsHistory.length})
                  </h4>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {ttsHistory.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                        No text to speech history yet
                      </p>
                    ) : (
                      ttsHistory.map((item, index) => (
                        <div
                          key={index}
                          className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all cursor-pointer"
                          onClick={() => useHistoryItem(item)}
                        >
                          <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 mb-2">
                            {item.content}
                          </p>
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>{formatDate(item.timestamp)}</span>
                            <span>{formatDuration(item.duration)}</span>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span className="text-blue-600 dark:text-blue-400">
                              {item.language}
                            </span>
                            <span className="text-orange-600 dark:text-orange-400">
                              {item.voiceModel}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
              >
                <Settings className="w-5 h-5" />
                {showSettings ? "Hide Settings" : "Show Settings"}
              </button>
              
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
              >
                <History className="w-5 h-5" />
                {showHistory ? "Hide History" : "Show History"}
              </button>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  isRecording ? 'bg-red-500 animate-pulse' : 
                  isLiveTranscribing ? 'bg-green-500 animate-pulse' : 
                  'bg-green-500'
                }`}></div>
                <span>{
                  isRecording ? 'Recording' : 
                  isLiveTranscribing ? 'Live Transcribing' : 
                  'Ready'
                }</span>
              </div>
            </div>
          </div>
        </div>

        {/* Browser Support Notice */}
        {!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 text-center">
            <p className="text-yellow-800 dark:text-yellow-300">
              ⚠️ Speech recognition works best in Chrome and Edge browsers. 
              Other browsers may have limited support.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}