// src/pages/History.jsx
import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Play, 
  Download, 
  Copy, 
  Trash2, 
  Star, 
  StarOff,
  Calendar,
  Clock,
  Volume2,
  MessageSquare,
  FileAudio,
  Archive,
  RefreshCw,
  X,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react";

// API endpoints
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const SPEECH_LAB_API = `${API_BASE_URL}/api`;
const VOICE_PERSONALIZER_API = `${API_BASE_URL}/api/voice`;

export default function History() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedItems, setSelectedItems] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState([]);

  // Fetch history data from both services
  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    setIsLoading(true);
    try {
      // Fetch from both services in parallel
      const [speechLabData, voiceProfilesData] = await Promise.all([
        fetchSpeechLabHistory(),
        fetchVoicePersonalizerHistory()
      ]);

      // Combine and normalize data
      const combinedHistory = [
        ...speechLabData,
        ...voiceProfilesData
      ];

      setHistory(combinedHistory);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSpeechLabHistory = async () => {
    try {
      // In a real app, you'd have endpoints like:
      // GET /api/history/speech-to-text
      // GET /api/history/text-to-speech
      
      // For now, we'll simulate with localStorage or session data
      const sttHistory = JSON.parse(localStorage.getItem('speechLab_stt_history') || '[]');
      const ttsHistory = JSON.parse(localStorage.getItem('speechLab_tts_history') || '[]');

      return [
        ...sttHistory.map(item => ({
          ...item,
          type: 'stt',
          service: 'speech-lab'
        })),
        ...ttsHistory.map(item => ({
          ...item,
          type: 'tts',
          service: 'speech-lab'
        }))
      ];
    } catch (error) {
      console.error('Error fetching Speech Lab history:', error);
      return [];
    }
  };

  const fetchVoicePersonalizerHistory = async () => {
    try {
      // Fetch voice profiles and their samples
      const profilesResponse = await fetch(`${VOICE_PERSONALIZER_API}/profiles`);
      if (!profilesResponse.ok) throw new Error('Failed to fetch profiles');
      
      const profiles = await profilesResponse.json();

      // Convert profiles and samples to history format
      const voiceHistory = profiles.flatMap(profile => {
        const profileHistory = {
          id: `voice-profile-${profile.id}`,
          type: 'voice-profile',
          service: 'voice-personalizer',
          content: profile.name,
          timestamp: new Date(profile.created_at),
          favorite: profile.is_active,
          accuracy: profile.overall_accuracy,
          samplesCount: profile.samples_count,
          tone: profile.tone,
          voiceModel: profile.voice_model,
          duration: `${profile.samples_count * 5}s` // Estimate based on samples
        };

        // If we had sample data, we could include individual samples too
        return [profileHistory];
      });

      return voiceHistory;
    } catch (error) {
      console.error('Error fetching Voice Personalizer history:', error);
      return [];
    }
  };

  // Save Speech Lab items to localStorage (simulate backend storage)
  const saveToSpeechLabHistory = (type, data) => {
    const key = `speechLab_${type}_history`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const newItem = {
      id: Date.now(),
      type,
      ...data,
      timestamp: new Date().toISOString(),
      favorite: false
    };
    
    const updated = [newItem, ...existing.slice(0, 49)]; // Keep last 50 items
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const tabs = [
    { id: "all", name: "All Items", count: history.length, icon: Archive },
    { id: "favorites", name: "Favorites", count: history.filter(item => item.favorite).length, icon: Star },
    { id: "stt", name: "Speech to Text", count: history.filter(item => item.type === "stt").length, icon: MessageSquare },
    { id: "tts", name: "Text to Speech", count: history.filter(item => item.type === "tts").length, icon: Volume2 },
    { id: "voice-profiles", name: "Voice Profiles", count: history.filter(item => item.type === "voice-profile").length, icon: FileAudio }
  ];

  const dateFilters = [
    { id: "all", name: "All Time" },
    { id: "today", name: "Today" },
    { id: "week", name: "This Week" },
    { id: "month", name: "This Month" },
    { id: "year", name: "This Year" }
  ];

  const typeFilters = [
    { id: "all", name: "All Types" },
    { id: "stt", name: "Speech to Text" },
    { id: "tts", name: "Text to Speech" },
    { id: "voice-profile", name: "Voice Profiles" }
  ];

  const sortOptions = [
    { id: "newest", name: "Newest First" },
    { id: "oldest", name: "Oldest First" },
    { id: "accuracy", name: "Highest Accuracy" },
    { id: "favorites", name: "Favorites First" }
  ];

  // Filter and sort history
  const filteredHistory = history
    .filter(item => {
      // Tab filter
      if (activeTab !== "all" && activeTab !== "favorites") {
        if (item.type !== activeTab) return false;
      }
      
      if (activeTab === "favorites" && !item.favorite) return false;

      // Search filter
      if (searchQuery && !item.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Date filter
      const now = new Date();
      const itemDate = new Date(item.timestamp);
      
      switch (dateFilter) {
        case "today":
          if (itemDate.toDateString() !== now.toDateString()) return false;
          break;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (itemDate < weekAgo) return false;
          break;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (itemDate < monthAgo) return false;
          break;
        case "year":
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          if (itemDate < yearAgo) return false;
          break;
        default:
          break;
      }

      // Type filter
      if (typeFilter !== "all" && item.type !== typeFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.timestamp) - new Date(a.timestamp);
        case "oldest":
          return new Date(a.timestamp) - new Date(b.timestamp);
        case "accuracy":
          return (b.accuracy || 0) - (a.accuracy || 0);
        case "favorites":
          return (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0);
        default:
          return new Date(b.timestamp) - new Date(a.timestamp);
      }
    });

  const toggleFavorite = async (id) => {
    const item = history.find(item => item.id === id);
    
    if (item.service === 'voice-personalizer' && item.type === 'voice-profile') {
      // Update voice profile active status via API
      try {
        const profileId = id.replace('voice-profile-', '');
        const response = await fetch(`${VOICE_PERSONALIZER_API}/profiles/${profileId}/activate`, {
          method: 'PUT'
        });
        
        if (response.ok) {
          // Refresh data
          fetchHistoryData();
        }
      } catch (error) {
        console.error('Error updating voice profile:', error);
      }
    } else {
      // Update local storage for Speech Lab items
      setHistory(history.map(item => 
        item.id === id ? { ...item, favorite: !item.favorite } : item
      ));
      
      // Update localStorage for Speech Lab items
      if (item.service === 'speech-lab') {
        const key = `speechLab_${item.type}_history`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = existing.map(storedItem =>
          storedItem.id === id ? { ...storedItem, favorite: !storedItem.favorite } : storedItem
        );
        localStorage.setItem(key, JSON.stringify(updated));
      }
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === filteredHistory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredHistory.map(item => item.id));
    }
  };

  const deleteItems = async (ids) => {
    if (!window.confirm(`Are you sure you want to delete ${ids.length} item(s)?`)) return;

    try {
      // Separate items by service
      const itemsToDelete = history.filter(item => ids.includes(item.id));
      const speechLabItems = itemsToDelete.filter(item => item.service === 'speech-lab');
      const voiceProfileItems = itemsToDelete.filter(item => item.service === 'voice-personalizer');

      // Delete Speech Lab items from localStorage
      speechLabItems.forEach(item => {
        const key = `speechLab_${item.type}_history`;
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = existing.filter(storedItem => storedItem.id !== item.id);
        localStorage.setItem(key, JSON.stringify(updated));
      });

      // Delete voice profiles via API
      for (const item of voiceProfileItems) {
        if (item.type === 'voice-profile') {
          const profileId = item.id.replace('voice-profile-', '');
          await fetch(`${VOICE_PERSONALIZER_API}/profiles/${profileId}`, {
            method: 'DELETE'
          });
        }
      }

      // Refresh data
      await fetchHistoryData();
      setSelectedItems([]);
      
    } catch (error) {
      console.error('Error deleting items:', error);
      alert('Error deleting items. Please try again.');
    }
  };

  const downloadItem = (item) => {
    let content = '';
    let filename = '';

    switch (item.type) {
      case 'stt':
        content = `Speech-to-Text Result\n\nText: ${item.content}\nAccuracy: ${item.accuracy}%\nLanguage: ${item.language}\nDuration: ${item.duration}\nDate: ${new Date(item.timestamp).toLocaleString()}`;
        filename = `stt-result-${item.id}.txt`;
        break;
      case 'tts':
        content = `Text-to-Speech Result\n\nText: ${item.content}\nVoice Model: ${item.voiceModel}\nLanguage: ${item.language}\nDuration: ${item.duration}\nDate: ${new Date(item.timestamp).toLocaleString()}`;
        filename = `tts-result-${item.id}.txt`;
        break;
      case 'voice-profile':
        content = `Voice Profile: ${item.content}\n\nTone: ${item.tone}\nAccuracy: ${item.accuracy}%\nSamples: ${item.samplesCount}\nVoice Model: ${item.voiceModel}\nCreated: ${new Date(item.timestamp).toLocaleString()}`;
        filename = `voice-profile-${item.id}.txt`;
        break;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const clearAllHistory = async () => {
    if (!window.confirm("Are you sure you want to clear all history? This action cannot be undone.")) return;

    try {
      // Clear Speech Lab history from localStorage
      localStorage.removeItem('speechLab_stt_history');
      localStorage.removeItem('speechLab_tts_history');

      // Note: We don't clear voice profiles as they are valuable user data
      
      // Refresh data
      await fetchHistoryData();
      setSelectedItems([]);
      
    } catch (error) {
      console.error('Error clearing history:', error);
      alert('Error clearing history. Please try again.');
    }
  };

  const getServiceIcon = (service) => {
    return service === 'speech-lab' ? '🧠' : '🎙️';
  };

  const getServiceName = (service) => {
    return service === 'speech-lab' ? 'Speech Lab' : 'Voice Personalizer';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mr-3" />
              <span className="text-lg text-gray-600 dark:text-gray-400">Loading history...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 pt-20 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600">
            📚 History & Saved Items
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Access your previous conversions, voice profiles, and saved items from both Speech Lab and Voice Personalizer
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
          
          {/* Stats Header */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{history.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Items</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {history.filter(item => item.favorite).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Favorites</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {history.filter(item => item.type === "stt").length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">STT Conversions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {history.filter(item => item.type === "voice-profile").length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Voice Profiles</div>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              
              {/* Tabs */}
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                        activeTab === tab.id
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.name}
                      <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-xs">
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search and Actions */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                {/* Search */}
                <div className="relative flex-1 lg:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search history..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Refresh Button */}
                <button
                  onClick={fetchHistoryData}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Clear All */}
                {history.length > 0 && (
                  <button
                    onClick={clearAllHistory}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date Range</label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                      {dateFilters.map(filter => (
                        <option key={filter.id} value={filter.id}>{filter.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Content Type</label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                      {typeFilters.map(filter => (
                        <option key={filter.id} value={filter.id}>{filter.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                      {sortOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Selection Bar */}
          {selectedItems.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-blue-700 dark:text-blue-300 font-medium">
                    {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={selectAll}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                  >
                    {selectedItems.length === filteredHistory.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Mark selected items as favorite
                      selectedItems.forEach(id => toggleFavorite(id));
                      setSelectedItems([]);
                    }}
                    className="flex items-center gap-2 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm transition"
                  >
                    <Star className="w-4 h-4" />
                    Favorite
                  </button>
                  <button
                    onClick={() => deleteItems(selectedItems)}
                    className="flex items-center gap-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* History List */}
          <div className="p-6">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  {searchQuery || dateFilter !== "all" || typeFilter !== "all" ? "No matching items found" : "No history yet"}
                </h3>
                <p className="text-gray-500 dark:text-gray-500 mb-6">
                  {searchQuery || dateFilter !== "all" || typeFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Your speech conversions and voice profiles will appear here"}
                </p>
                {(searchQuery || dateFilter !== "all" || typeFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setDateFilter("all");
                      setTypeFilter("all");
                    }}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-white dark:bg-gray-800 rounded-xl border-2 transition-all ${
                      selectedItems.includes(item.id)
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                          className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                item.type === "stt" 
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                  : item.type === "tts"
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                  : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                              }`}>
                                {item.type === "stt" ? <MessageSquare className="w-4 h-4" /> : 
                                 item.type === "tts" ? <Volume2 className="w-4 h-4" /> : 
                                 <FileAudio className="w-4 h-4" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {item.content}
                                  </p>
                                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-600 dark:text-gray-400">
                                    {getServiceIcon(item.service)} {getServiceName(item.service)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatTimeAgo(item.timestamp)}
                                  </span>
                                  {item.duration && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {item.duration}
                                      </span>
                                    </>
                                  )}
                                  {item.accuracy && (
                                    <>
                                      <span>•</span>
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        item.accuracy >= 90 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                                        item.accuracy >= 80 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" :
                                        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                      }`}>
                                        {item.accuracy}% accuracy
                                      </span>
                                    </>
                                  )}
                                  {item.voiceModel && (
                                    <>
                                      <span>•</span>
                                      <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded-full text-xs">
                                        {item.voiceModel}
                                      </span>
                                    </>
                                  )}
                                  {item.samplesCount && (
                                    <>
                                      <span>•</span>
                                      <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full text-xs">
                                        {item.samplesCount} samples
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleFavorite(item.id)}
                                className={`p-2 rounded-lg transition ${
                                  item.favorite
                                    ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    : "bg-gray-100 text-gray-400 hover:bg-yellow-50 hover:text-yellow-500 dark:bg-gray-700 dark:hover:bg-yellow-900/20"
                                }`}
                                title={item.favorite ? "Remove from favorites" : "Add to favorites"}
                              >
                                {item.favorite ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                              </button>
                              
                              {item.type !== 'voice-profile' && (
                                <button
                                  onClick={() => copyToClipboard(item.content)}
                                  className="p-2 bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-blue-900/20 rounded-lg transition"
                                  title="Copy text"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => downloadItem(item)}
                                className="p-2 bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-green-900/20 rounded-lg transition"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => deleteItems([item.id])}
                                className="p-2 bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-red-900/20 rounded-lg transition"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination (simplified) */}
            {filteredHistory.length > 0 && (
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredHistory.length} of {history.length} items
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    Previous
                  </button>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}