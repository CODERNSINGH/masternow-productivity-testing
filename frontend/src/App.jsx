import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { startKeepAlive, stopKeepAlive } from './services/keepAliveService';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import LecturePlayer from './pages/LecturePlayer';
import ToDo from './pages/ToDo';
import AddCourse from './pages/AddCourse';
import { Books } from './pages/Placeholders';
import PersonalisedAI from './pages/PersonalisedAI';
import StreakMaker from './pages/StreakMaker';
import Settings from './pages/Settings';
import AuthCallback from './pages/AuthCallback';
import { PrivacyPolicy, ContactUs, AboutUs } from './pages/LegalPages';

function App() {
  useEffect(() => {
    // Start keep-alive service to prevent Render server from spinning down
    startKeepAlive();

    // Cleanup on app unmount
    return () => stopKeepAlive();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lecture/:id" element={<LecturePlayer />} />
        <Route path="/todo" element={<ToDo />} />
        <Route path="/add-course" element={<AddCourse />} />
        <Route path="/streak" element={<StreakMaker />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/books" element={<Books />} />
        <Route path="/personal-ai" element={<PersonalisedAI />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/about" element={<AboutUs />} />
      </Routes>
    </Router>
  );
}

export default App;
