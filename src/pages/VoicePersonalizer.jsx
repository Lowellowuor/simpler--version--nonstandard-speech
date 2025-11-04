// src/pages/VoicePersonalizer.jsx
import { useState, useRef, useEffect } from "react";
import { 
  Mic, 
  Save, 
  Play, 
  Trash2, 
  User, 
  Settings, 
  Download, 
  Upload, 
  Volume2,
  Star,
  Award,
  Target,
  BarChart3,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Bookmark,
  Share
} from "lucide-react";

export default function VoicePersonalizer() {
  // Core states
  const [currentStep, setCurrentStep] = useState(1);
  const [samples, setSamples] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSample, setActiveSample] = useState(null);
  
  // Voice profile states
  const [voiceName, setVoiceName] = useState("");
  const [tone, setTone] = useState("neutral");
  const [accent, setAccent] = useState("neutral");
  const [speakingRate, setSpeakingRate] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [voiceModel, setVoiceModel] = useState("standard");
  
  // User profiles
  const [userProfiles, setUserProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Training phrases for different categories
  const trainingPhrases = {
    basic: [
      "The quick brown fox jumps over the lazy dog",
      "Hello, how are you doing today?",
      "I would like to order some food please",
      "The weather is beautiful outside",
      "Can you help me with this problem?"
    ],
    conversational: [
      "Thank you very much for your assistance",
      "I need to go to the store later",
      "What time is our meeting tomorrow?",
      "This is really important to me",
      "Could you please speak more slowly?"
    ],
    emergency: [
      "I need help immediately",
      "Please call for medical assistance",
      "I'm not feeling well right now",
      "This is an emergency situation",
      "I need to contact my family"
    ],
    personal: [
      "My name is [Your Name]",
      "I live at [Your Address]",
      "My phone number is [Your Number]",
      "I was born on [Your Birthday]",
      "My favorite food is [Your Food]"
    ]
  };

  // Voice tones
  const tones = [
    { id: "neutral", name: "Neutral", description: "Balanced and clear", icon: "🎯" },
    { id: "warm", name: "Warm", description: "Friendly and comforting", icon: "❤️" },
    { id: "energetic", name: "Energetic", description: "Lively and enthusiastic", icon: "⚡" },
    { id: "calm", name: "Calm", description: "Relaxed and soothing", icon: "🌊" },
    { id: "professional", name: "Professional", description: "Formal and clear", icon: "💼" },
    { id: "friendly", name: "Friendly", description: "Casual and approachable", icon: "😊" }
  ];

  // Accent options
  const accents = [
    { id: "neutral", name: "Neutral", description: "Standard pronunciation" },
    { id: "kenyan", name: "Kenyan English", description: "East African influence" },
    { id: "british", name: "British", description: "UK English patterns" },
    { id: "american", name: "American", description: "US English patterns" },
    { id: "custom", name: "Custom", description: "Personalized accent" }
  ];

  // Voice models
  const voiceModels = [
    { id: "standard", name: "Standard Model", accuracy: "85%", training: "Basic" },
    { id: "enhanced", name: "Enhanced Model", accuracy: "92%", training: "Recommended" },
    { id: "premium", name: "Premium Model", accuracy: "96%", training: "Advanced" },
    { id: "custom", name: "Custom Model", accuracy: "98%", training: "Personalized" }
  ];

  // Sample user profiles (would come from backend)
  const sampleProfiles = [
    {
      id: 1,
      name: "John's Voice",
      tone: "warm",
      samples: 8,
      accuracy: 92,
      created: "2024-01-15",
      isActive: true
    },
    {
      id: 2,
      name: "Professional Tone",
      tone: "professional",
      samples: 5,
      accuracy: 87,
      created: "2024-01-10",
      isActive: false
    }
  ];

  useEffect(() => {
    setUserProfiles(sampleProfiles);
    setActiveProfile(sampleProfiles.find(p => p.isActive));
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        setIsProcessing(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Get current phrase category
        const categories = Object.keys(trainingPhrases);
        const currentCategory = categories[Math.floor(samples.length / 5) % categories.length];
        const phrases = trainingPhrases[currentCategory];
        const currentPhrase = phrases[samples.length % phrases.length];
        
        const newSample = {
          id: Date.now(),
          phrase: currentPhrase,
          audioUrl: audioUrl,
          duration: "5s",
          date: new Date().toLocaleDateString(),
          category: currentCategory,
          status: "processed",
          accuracy: Math.floor(Math.random() * 20) + 80 // Simulated accuracy
        };
        
        setTimeout(() => {
          setSamples([...samples, newSample]);
          setIsProcessing(false);
        }, 1500);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Auto-stop after 5 seconds
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 5000);
      
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

  const playSample = (sampleId) => {
    setActiveSample(sampleId);
    // In real implementation, this would play the audio
    setTimeout(() => setActiveSample(null), 3000);
  };

  const deleteSample = (sampleId) => {
    setSamples(samples.filter(sample => sample.id !== sampleId));
  };

  const retrainSample = (sampleId) => {
    const sample = samples.find(s => s.id === sampleId);
    if (sample) {
      // Simulate retraining
      const updatedSamples = samples.map(s => 
        s.id === sampleId ? { ...s, status: "processing", accuracy: s.accuracy + 5 } : s
      );
      setSamples(updatedSamples);
      
      setTimeout(() => {
        const finalSamples = samples.map(s => 
          s.id === sampleId ? { ...s, status: "processed" } : s
        );
        setSamples(finalSamples);
      }, 1000);
    }
  };

  const calculateProgress = () => {
    const totalRecommended = 20;
    return Math.min((samples.length / totalRecommended) * 100, 100);
  };

  const getAccuracyLevel = (accuracy) => {
    if (accuracy >= 95) return { color: "text-green-600", label: "Excellent" };
    if (accuracy >= 85) return { color: "text-blue-600", label: "Good" };
    if (accuracy >= 75) return { color: "text-yellow-600", label: "Fair" };
    return { color: "text-red-600", label: "Needs Work" };
  };

  const saveVoiceProfile = () => {
    if (samples.length < 5) {
      alert("Please record at least 5 voice samples for better personalization");
      return;
    }
    
    if (!voiceName.trim()) {
      alert("Please give your custom voice a name");
      return;
    }

    setIsProcessing(true);
    
    const newProfile = {
      id: Date.now(),
      name: voiceName,
      tone: tone,
      accent: accent,
      samples: samples.length,
      accuracy: Math.floor(samples.reduce((acc, sample) => acc + sample.accuracy, 0) / samples.length),
      created: new Date().toISOString().split('T')[0],
      isActive: true
    };

    setTimeout(() => {
      setUserProfiles([...userProfiles.map(p => ({ ...p, isActive: false })), newProfile]);
      setActiveProfile(newProfile);
      setIsProcessing(false);
      
      alert(`✅ Voice profile "${voiceName}" saved successfully!`);
      setCurrentStep(1);
      setSamples([]);
      setVoiceName("");
    }, 2000);
  };

  const activateProfile = (profileId) => {
    const updatedProfiles = userProfiles.map(profile => ({
      ...profile,
      isActive: profile.id === profileId
    }));
    setUserProfiles(updatedProfiles);
    setActiveProfile(updatedProfiles.find(p => p.isActive));
  };

  const deleteProfile = (profileId) => {
    if (window.confirm("Are you sure you want to delete this voice profile?")) {
      const updatedProfiles = userProfiles.filter(profile => profile.id !== profileId);
      setUserProfiles(updatedProfiles);
      if (activeProfile?.id === profileId) {
        setActiveProfile(updatedProfiles[0] || null);
      }
    }
  };

  const progress = calculateProgress();
  const currentCategory = Object.keys(trainingPhrases)[Math.floor(samples.length / 5) % Object.keys(trainingPhrases).length];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950 pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            🎙️ Voice Personalizer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Create and manage your unique voice profiles with AI-powered personalization
          </p>
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
                  Record different phrases to train your personal voice model (5-20 recommended)
                </p>
                
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
                        {samples.length > 0 ? Math.round(samples.reduce((acc, s) => acc + s.accuracy, 0) / samples.length) : 0}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Avg Accuracy</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{currentCategory}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Current Category</div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Training Progress</span>
                      <span>{samples.length}/20 samples</span>
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
                      disabled={isProcessing}
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
                  {!isRecording && !isProcessing && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
                      <div className="text-sm text-blue-600 dark:text-blue-400 mb-2 font-semibold">
                        Current Category: {currentCategory.toUpperCase()}
                      </div>
                      <p className="text-lg font-medium text-blue-800 dark:text-blue-300">
                        "{trainingPhrases[currentCategory][samples.length % trainingPhrases[currentCategory].length]}"
                      </p>
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
                      const accuracyInfo = getAccuracyLevel(sample.accuracy);
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
                                    {sample.accuracy}%
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                  <span>{sample.duration}</span>
                                  <span>•</span>
                                  <span>{sample.date}</span>
                                  <span>•</span>
                                  <span className="capitalize">{sample.category}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => playSample(sample.id)}
                                className="p-2 bg-green-500 hover:bg-green-600 rounded-lg text-white transition"
                                title="Play sample"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => retrainSample(sample.id)}
                                className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition"
                                title="Retrain for better accuracy"
                              >
                                <Target className="w-4 h-4" />
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
                          {sample.status === "processing" && (
                            <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Processing...
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Next Button */}
              {samples.length >= 5 && (
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

                {/* Accent & Model */}
                <div className="space-y-6">
                  {/* Accent Selection */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Accent Preference</h3>
                    <select
                      value={accent}
                      onChange={(e) => setAccent(e.target.value)}
                      className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    >
                      {accents.map((accentOption) => (
                        <option key={accentOption.id} value={accentOption.id}>
                          {accentOption.name} - {accentOption.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Voice Model Selection */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">AI Model</h3>
                    <div className="space-y-3">
                      {voiceModels.map((model) => (
                        <div
                          key={model.id}
                          onClick={() => setVoiceModel(model.id)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            voiceModel === model.id
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="font-semibold">{model.name}</div>
                            <div className="text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                              {model.accuracy}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Training: {model.training}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Advanced Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Speaking Rate: {speakingRate.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={speakingRate}
                      onChange={(e) => setSpeakingRate(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span>Slower</span>
                      <span>Faster</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Pitch: {pitch > 0 ? `+${pitch}` : pitch}
                    </label>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="1"
                      value={pitch}
                      onChange={(e) => setPitch(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span>Deeper</span>
                      <span>Higher</span>
                    </div>
                  </div>
                </div>
              </div>

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
                        <span className="text-gray-600 dark:text-gray-400">Accent:</span>
                        <span className="font-semibold">{accents.find(a => a.id === accent)?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Speaking Rate:</span>
                        <span className="font-semibold">{speakingRate.toFixed(1)}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">AI Model:</span>
                        <span className="font-semibold">{voiceModels.find(m => m.id === voiceModel)?.name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Existing Profiles */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Your Voice Profiles</h3>
                  <div className="space-y-3">
                    {userProfiles.map((profile) => (
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
                          <div>{profile.accuracy}% accuracy</div>
                          <div>{profile.tone} tone</div>
                          <div>{profile.created}</div>
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
                    ))}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={saveVoiceProfile}
                disabled={isProcessing || !voiceName.trim()}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-lg transition-all ${
                  isProcessing
                    ? "bg-purple-500/50 cursor-wait"
                    : !voiceName.trim()
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
                  Your personalized voice profile has been successfully created and is ready to use.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-purple-600">{samples.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Training Samples</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-blue-600">
                      {samples.length > 0 ? Math.round(samples.reduce((acc, s) => acc + s.accuracy, 0) / samples.length) : 0}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Overall Accuracy</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-green-600">{tones.find(t => t.id === tone)?.name}</div>
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
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Create Another Profile
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