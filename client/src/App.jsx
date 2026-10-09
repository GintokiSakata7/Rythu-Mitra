import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import HomePage from './pages/HomePage.jsx';
import FindOpportunityPage from './pages/FindOpportunityPage.jsx';
import BuyerPage from './pages/BuyerPage.jsx';
import PostRequirementPage from './pages/PostRequirementPage.jsx';
import AssistantPage from './pages/AssistantPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import { api } from './lib/api.js';

export default function App() {
  useEffect(() => {
    // Silently warm up the Render backend on initial app load to eliminate cold-start delay
    api.health().catch(() => {});
  }, []);

  return (
    <div className="mobile-app-shell">
      <Navbar />
      <main className="main-content-viewport">
        <div className="content-container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/find" element={<FindOpportunityPage />} />
            <Route path="/buyers" element={<BuyerPage />} />
            <Route path="/post-requirement" element={<PostRequirementPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
