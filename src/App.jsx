import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Layout/Header";
import VoicePersonalizer from "./pages/VoicePersonalizer";
import ProfileSettings from "./pages/ProfileSettings";
import SpeechLab from "./pages/SpeechLab";
import History from "./pages/History";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            {/* Redirect root to Speech Lab as the main page */}
            <Route path="/" element={<Navigate to="/speech-lab" replace />} />
            
            {/* Main application routes */}
            <Route path="/speech-lab" element={<SpeechLab />} />
            <Route path="/voice-personalizer" element={<VoicePersonalizer />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/history" element={<History />} />
            
            {/* Fallback route for 404 pages */}
            <Route path="*" element={<Navigate to="/speech-lab" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}