// src/pages/ProfileSettings.jsx
import { useState } from "react";
import { 
  User, 
  Settings, 
  Save, 
  Download, 
  Upload, 
  Shield, 
  Bell, 
  Eye,
  Volume2,
  Database,
  Trash2,
  Edit3,
  CheckCircle2,
  Loader2,
  MapPin,
  Calendar,
  BarChart3,
  Star,
  Award,
  Users,
  Lock,
  HardDrive,
  MousePointer,
  Keyboard
} from "lucide-react";

export default function ProfileSettings() {
  // User Profile States
  const [userProfile, setUserProfile] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    location: "Nairobi, Kenya",
    joinDate: "2024-01-15",
    avatar: "👤"
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...userProfile });

  // Voice Settings
  const [voiceSettings, setVoiceSettings] = useState({
    primaryVoice: "personalized",
    fallbackVoice: "standard",
    speakingRate: 1.0,
    pitch: 0,
    volume: 80,
    stability: 0.5,
    similarity: 0.75
  });

  // Privacy & Data
  const [privacy, setPrivacy] = useState({
    dataCollection: true,
    shareUsageData: true,
    autoSave: true,
    cloudSync: true,
    deleteAfter: "30days"
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    trainingReminders: true,
    newFeatures: false,
    securityAlerts: true,
    voiceUpdates: true
  });

  // Accessibility Settings
  const [accessibility, setAccessibility] = useState({
    highContrast: false,
    largeText: false,
    screenReader: true,
    reducedMotion: false,
    voiceGuidance: true,
    playbackSpeed: 1.0
  });

  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Voice models
  const voiceModels = [
    { id: "personalized", name: "My Personalized Voice", accuracy: "95%" },
    { id: "standard", name: "Standard Voice", accuracy: "85%" },
    { id: "warm", name: "Warm Tone", accuracy: "82%" },
    { id: "professional", name: "Professional", accuracy: "88%" }
  ];

  // Usage statistics
  const usageStats = {
    totalSessions: 147,
    wordsProcessed: 12589,
    voiceSamples: 23,
    accuracy: 92,
    favoritePhrase: "Hello, how are you?",
    mostUsedTime: "14:00 - 16:00"
  };

  // Profile Management Features
  const handleSaveProfile = () => {
    setIsSaving(true);
    setTimeout(() => {
      setUserProfile(editForm);
      setIsEditing(false);
      setIsSaving(false);
      setSaveMessage("Profile updated successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    }, 1000);
  };

  const handleCancelEdit = () => {
    setEditForm({ ...userProfile });
    setIsEditing(false);
  };

  // Data Management Features
  const handleExportData = () => {
    const data = {
      userProfile,
      voiceSettings,
      preferences: {
        accessibility,
        privacy,
        notifications
      },
      usageStats,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voicebridge-backup-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setSaveMessage("Data exported successfully!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setSaveMessage("Data imported successfully!");
          setTimeout(() => setSaveMessage(""), 3000);
        } catch (error) {
          setSaveMessage("Error importing data. Invalid file format.");
          setTimeout(() => setSaveMessage(""), 3000);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm("Are you sure you want to reset all settings to default?")) {
      setIsSaving(true);
      setTimeout(() => {
        setVoiceSettings({
          primaryVoice: "personalized",
          fallbackVoice: "standard",
          speakingRate: 1.0,
          pitch: 0,
          volume: 80,
          stability: 0.5,
          similarity: 0.75
        });
        setPrivacy({
          dataCollection: true,
          shareUsageData: true,
          autoSave: true,
          cloudSync: true,
          deleteAfter: "30days"
        });
        setAccessibility({
          highContrast: false,
          largeText: false,
          screenReader: true,
          reducedMotion: false,
          voiceGuidance: true,
          playbackSpeed: 1.0
        });
        setIsSaving(false);
        setSaveMessage("All settings reset to default!");
        setTimeout(() => setSaveMessage(""), 3000);
      }, 1500);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you absolutely sure? This will permanently delete your account and all data.")) {
      if (window.confirm("Type 'DELETE' to confirm permanent account deletion:")) {
        setSaveMessage("Account deletion scheduled. You will receive a confirmation email.");
        setTimeout(() => setSaveMessage(""), 5000);
      }
    }
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: User },
    { id: "voice", name: "Voice", icon: Volume2 },
    { id: "accessibility", name: "Accessibility", icon: Eye },
    { id: "privacy", name: "Privacy & Data", icon: Shield },
    { id: "notifications", name: "Notifications", icon: Bell },
    { id: "data", name: "Data Management", icon: Database }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-6">
                <div className="text-6xl">{userProfile.avatar}</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{userProfile.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{userProfile.email}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {userProfile.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Member since {userProfile.joinDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      Premium User
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Edit Profile Form */}
            {isEditing && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Edit Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <input
                      type="text"
                      value={editForm.location}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Usage Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Usage Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{usageStats.totalSessions}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{usageStats.wordsProcessed}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Words Processed</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">{usageStats.voiceSamples}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Voice Samples</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600">{usageStats.accuracy}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl md:col-span-2">
                  <div className="text-lg font-semibold text-red-600">{usageStats.favoritePhrase}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Most Used Phrase</div>
                </div>
              </div>
            </div>
          </div>
        );

      case "voice":
        return (
          <div className="space-y-6">
            {/* Voice Model Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Voice Model Selection</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Voice Model</label>
                  <select
                    value={voiceSettings.primaryVoice}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, primaryVoice: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    {voiceModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.accuracy})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Fallback Voice Model</label>
                  <select
                    value={voiceSettings.fallbackVoice}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, fallbackVoice: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    {voiceModels.filter(m => m.id !== voiceSettings.primaryVoice).map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.accuracy})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Voice Customization */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Voice Customization</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Speaking Rate: {voiceSettings.speakingRate.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={voiceSettings.speakingRate}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, speakingRate: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Pitch: {voiceSettings.pitch > 0 ? `+${voiceSettings.pitch}` : voiceSettings.pitch}
                  </label>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    step="1"
                    value={voiceSettings.pitch}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, pitch: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Volume: {voiceSettings.volume}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={voiceSettings.volume}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, volume: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Stability: {voiceSettings.stability.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={voiceSettings.stability}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, stability: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Similarity: {voiceSettings.similarity.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={voiceSettings.similarity}
                    onChange={(e) => setVoiceSettings(prev => ({ ...prev, similarity: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "accessibility":
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Display & Interaction</h3>
              <div className="space-y-4">
                {[
                  { key: 'highContrast', label: 'High Contrast Mode', description: 'Increase color contrast for better visibility' },
                  { key: 'largeText', label: 'Large Text Size', description: 'Use larger text throughout the application' },
                  { key: 'screenReader', label: 'Screen Reader Support', description: 'Optimize for screen reader compatibility' },
                  { key: 'reducedMotion', label: 'Reduced Motion', description: 'Minimize animations and transitions' },
                  { key: 'voiceGuidance', label: 'Voice Guidance', description: 'Provide audio cues for interactions' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-xl">
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{item.description}</div>
                    </div>
                    <button
                      onClick={() => setAccessibility(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className={`w-12 h-6 rounded-full transition-all ${
                        accessibility[item.key] ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        accessibility[item.key] ? 'transform translate-x-7' : 'transform translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Playback Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Playback Speed: {accessibility.playbackSpeed}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={accessibility.playbackSpeed}
                    onChange={(e) => setAccessibility(prev => ({ ...prev, playbackSpeed: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span>Slower</span>
                    <span>Faster</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Data & Privacy</h3>
              <div className="space-y-4">
                {[
                  { key: 'dataCollection', label: 'Data Collection', description: 'Allow collection of usage data to improve service' },
                  { key: 'shareUsageData', label: 'Share Usage Data', description: 'Share anonymous usage data for research' },
                  { key: 'autoSave', label: 'Auto-save Sessions', description: 'Automatically save your speech sessions' },
                  { key: 'cloudSync', label: 'Cloud Sync', description: 'Sync your data across devices' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-xl">
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{item.description}</div>
                    </div>
                    <button
                      onClick={() => setPrivacy(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className={`w-12 h-6 rounded-full transition-all ${
                        privacy[item.key] ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        privacy[item.key] ? 'transform translate-x-7' : 'transform translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Data Retention</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Auto-delete Sessions After</label>
                <select
                  value={privacy.deleteAfter}
                  onChange={(e) => setPrivacy(prev => ({ ...prev, deleteAfter: e.target.value }))}
                  className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="7days">7 Days</option>
                  <option value="30days">30 Days</option>
                  <option value="90days">90 Days</option>
                  <option value="never">Never</option>
                </select>
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: 'emailUpdates', label: 'Email Updates', description: 'Receive important updates via email' },
                  { key: 'trainingReminders', label: 'Training Reminders', description: 'Reminders to train your voice model' },
                  { key: 'newFeatures', label: 'New Features', description: 'Notifications about new features and updates' },
                  { key: 'securityAlerts', label: 'Security Alerts', description: 'Important security and privacy notifications' },
                  { key: 'voiceUpdates', label: 'Voice Model Updates', description: 'Updates about your voice model training' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-xl">
                    <div>
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{item.description}</div>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className={`w-12 h-6 rounded-full transition-all ${
                        notifications[item.key] ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        notifications[item.key] ? 'transform translate-x-7' : 'transform translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "data":
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Data Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={handleExportData}
                  className="p-4 border-2 border-green-200 dark:border-green-800 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-all flex items-center gap-3"
                >
                  <Download className="w-6 h-6 text-green-600" />
                  <div className="text-left">
                    <div className="font-semibold">Export All Data</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Download your data as JSON</div>
                  </div>
                </button>

                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                    id="import-data"
                  />
                  <label
                    htmlFor="import-data"
                    className="p-4 border-2 border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center gap-3 cursor-pointer"
                  >
                    <Upload className="w-6 h-6 text-blue-600" />
                    <div className="text-left">
                      <div className="font-semibold">Import Data</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Restore from backup file</div>
                    </div>
                  </label>
                </div>

                <button
                  onClick={handleResetSettings}
                  className="p-4 border-2 border-orange-200 dark:border-orange-800 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all flex items-center gap-3"
                >
                  <Settings className="w-6 h-6 text-orange-600" />
                  <div className="text-left">
                    <div className="font-semibold">Reset Settings</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Restore default settings</div>
                  </div>
                </button>

                <button
                  onClick={handleDeleteAccount}
                  className="p-4 border-2 border-red-200 dark:border-red-800 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center gap-3"
                >
                  <Trash2 className="w-6 h-6 text-red-600" />
                  <div className="text-left">
                    <div className="font-semibold">Delete Account</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Permanently delete all data</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Storage Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Voice Samples</span>
                  <span className="font-semibold">47.3 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Session History</span>
                  <span className="font-semibold">12.1 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>User Preferences</span>
                  <span className="font-semibold">0.8 MB</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total Storage Used</span>
                    <span>60.2 MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            👤 Profile & Settings
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Manage your account, preferences, and application settings
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
          
          {/* Save Message */}
          {saveMessage && (
            <div className="bg-green-100 dark:bg-green-900/30 border-b border-green-200 dark:border-green-800 px-6 py-3">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
                <CheckCircle2 className="w-4 h-4" />
                {saveMessage}
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 bg-gray-50 dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-700">
              <nav className="p-4 space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                        activeTab === tab.id
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}