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
  Languages
} from "lucide-react";

export default function SpeechLab() {
  // Core states
  const [mode, setMode] = useState("stt"); // 'tts' or 'stt'
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  
  // Settings states
  const [showSettings, setShowSettings] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [voiceModel, setVoiceModel] = useState("default");
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);

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

  // Simulate non-standard speech recognition
  const simulateSpeechRecognition = (audioBlob) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const responses = [
          "I would like to have some water please",
          "Can you help me with this problem?",
          "I'm feeling much better today thank you",
          "What time does the store open tomorrow?",
          "I need to make an important phone call",
          "The weather is really nice outside today",
          "Could you please speak a little slower?",
          "I want to watch my favorite TV show",
          "When is our next family gathering?",
          "This food tastes absolutely delicious"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        resolve(randomResponse);
      }, 3000);
    });
  };

  // Simulate text-to-speech generation
  const simulateTextToSpeech = (text) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In real implementation, this would call your TTS API
        const mockAudioUrl = "https://assets.mixkit.co/active_storage/sfx/257/257-preview.mp3";
        resolve(mockAudioUrl);
      }, 2000);
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
        setIsLoading(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Process the recording
        const cleanedText = await simulateSpeechRecognition(audioBlob);
        setTranscribedText(cleanedText);
        
        // Generate speech from the recognized text
        const generatedAudioUrl = await simulateTextToSpeech(cleanedText);
        setAudioUrl(generatedAudioUrl);
        
        setIsLoading(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Auto-stop after 10 seconds for demo
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

  // Handle text-to-speech conversion
  const handleTextToSpeech = async () => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    const generatedAudioUrl = await simulateTextToSpeech(text);
    setAudioUrl(generatedAudioUrl);
    setIsLoading(false);
  };

  // Audio playback controls
  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // Utility functions
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transcribedText || text);
      alert("Text copied to clipboard!");
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const downloadText = () => {
    const content = transcribedText || text;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speech-lab-${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareContent = async () => {
    const content = transcribedText || text;
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
    setAudioUrl("");
    setAudioFile(null);
    setIsPlaying(false);
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      // Simulate processing uploaded audio
      setIsLoading(true);
      setTimeout(async () => {
        const cleanedText = await simulateSpeechRecognition(file);
        setTranscribedText(cleanedText);
        const generatedAudioUrl = await simulateTextToSpeech(cleanedText);
        setAudioUrl(generatedAudioUrl);
        setIsLoading(false);
      }, 2000);
    }
  };

  // Save to history (simulated)
  const saveToHistory = () => {
    const content = transcribedText || text;
    if (content.trim()) {
      alert(`Saved to history: "${content}"`);
      // In real app, this would save to localStorage or database
    }
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
            Convert between speech and text with AI-powered understanding of non-standard speech patterns
          </p>
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
                <div className="text-center">
                  {!isRecording ? (
                    <div className="space-y-4">
                      <button
                        onClick={startRecording}
                        disabled={isLoading}
                        className="px-12 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl font-bold text-lg shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <Mic className="w-8 h-8 inline-block mr-3" />
                        Start Speaking
                      </button>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Or upload an audio file
                      </div>
                      
                      <div className="relative inline-block">
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={handleAudioUpload}
                          className="hidden"
                          id="audio-upload"
                        />
                        <label
                          htmlFor="audio-upload"
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold cursor-pointer transition-all"
                        >
                          <Upload className="w-5 h-5" />
                          Upload Audio File
                        </label>
                      </div>
                    </div>
                  ) : (
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
                      <p className="text-gray-600 dark:text-gray-400">Speak now... Processing your speech</p>
                    </div>
                  )}
                </div>

                {/* File Info */}
                {audioFile && !isRecording && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 text-center">
                    <p className="text-purple-800 dark:text-purple-300">
                      📁 Ready to process: {audioFile.name}
                    </p>
                  </div>
                )}

                {/* Results Section */}
                {(transcribedText || isLoading) && (
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
                            onClick={playAudio}
                            disabled={isPlaying || !audioUrl}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-all"
                          >
                            <Play className="w-4 h-4" />
                            Play Clean Speech
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
                          <button
                            onClick={saveToHistory}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
                          >
                            <Bookmark className="w-4 h-4" />
                            Save
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

                  <button
                    onClick={clearAll}
                    className="px-6 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Clear All
                  </button>
                </div>

                {/* Audio Playback */}
                {audioUrl && !isLoading && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-green-800 dark:text-green-300 text-lg flex items-center gap-2">
                        <Volume2 className="w-5 h-5" />
                        Generated Speech:
                      </h4>
                      <div className="flex gap-3">
                        <button
                          onClick={playAudio}
                          disabled={isPlaying}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:bg-green-400 transition-all"
                        >
                          <Play className="w-4 h-4" />
                          Play
                        </button>
                        <button
                          onClick={stopAudio}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                        >
                          <Square className="w-4 h-4" />
                          Stop
                        </button>
                      </div>
                    </div>
                    <audio 
                      ref={audioRef} 
                      src={audioUrl} 
                      onEnded={() => setIsPlaying(false)}
                      className="w-full"
                    />
                    
                    {/* Additional Actions */}
                    <div className="flex flex-wrap gap-3 mt-4">
                      <button
                        onClick={downloadText}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Download Text
                      </button>
                      <button
                        onClick={shareContent}
                        className="flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition-all"
                      >
                        <Share className="w-4 h-4" />
                        Share
                      </button>
                      <button
                        onClick={saveToHistory}
                        className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-all"
                      >
                        <Bookmark className="w-4 h-4" />
                        Save to History
                      </button>
                    </div>
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

          {/* Footer Actions */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              <Settings className="w-5 h-5" />
              {showSettings ? "Hide Settings" : "Show Settings"}
            </button>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span>{isRecording ? 'Recording' : 'Ready'}</span>
              </div>
              <button 
                onClick={() => window.location.href = '/history'}
                className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition"
              >
                <History className="w-4 h-4" />
                View History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}