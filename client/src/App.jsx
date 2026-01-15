import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SolvedProvider, useSolved } from './context/SolvedContext';
import ConnectModal from './components/ConnectModal';
import './index.css';

// Components
import HomePage from './components/HomePage';
import ListPage from './components/ListPage';
import SearchPage from './components/SearchPage';
import SavedPage from './components/SavedPage';
import RoadmapPage from './components/RoadmapPage';
import DailyPage from './components/DailyPage';
import ProgressPage from './components/ProgressPage';
import CompanyPage from './components/CompanyPage';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent({ savedVideos, onToggleSave }) {
  // Helper to close mobile menu or handle extensive nav logic if needed

  // Navbar Search Logic
  const [navbarSearch, setNavbarSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Context
  const { leetcodeUsername, disconnect, syncWithLeetCode, isSyncing } = useSolved();
  const [showConnectModal, setShowConnectModal] = useState(false);

  const handleNavbarSearch = (e) => {
    e.preventDefault();
    if (navbarSearch.trim()) {
      navigate(`/search/${navbarSearch}`);
    }
  };

  // Determine if we should show 'has-results' style (solid background) on navbar
  // If not on Home OR if on Home but scrolled down (handled by CSS sticky? No, original had JS Logic)
  // Original logic: view !== 'home' 
  const isHome = location.pathname === '/';
  const navbarClass = !isHome ? 'has-results' : '';

  return (
    <>
      <div className="background-glow"></div>

      {showConnectModal && <ConnectModal onClose={() => setShowConnectModal(false)} />}

      {/* Navbar */}
      <nav className={`navbar ${navbarClass}`}>
        <div className="logo" onClick={() => navigate('/')}>
          Leet<span>Vision</span>
        </div>

        <div className="nav-center">
          <ul className="nav-links">
            <li className="nav-item">
              <Link to="/top-100-leetcode" style={{ color: 'inherit', textDecoration: 'none' }}>Top 100</Link>
            </li>
            <li className="nav-item">
              <Link to="/blind-75" style={{ color: 'inherit', textDecoration: 'none' }}>Blind 75</Link>
            </li>
            <li className="nav-item dropdown">
              Difficulty ▾
              <div className="dropdown-content">
                <div><Link to="/leetcode-easy" style={{ color: 'inherit', textDecoration: 'none' }}>Easy</Link></div>
                <div><Link to="/leetcode-medium" style={{ color: 'inherit', textDecoration: 'none' }}>Medium</Link></div>
                <div><Link to="/leetcode-hard" style={{ color: 'inherit', textDecoration: 'none' }}>Hard</Link></div>
              </div>
            </li>
            <li className="nav-item dropdown">
              Topics ▾
              <div className="dropdown-content">
                <div><Link to="/topics/array" style={{ color: 'inherit', textDecoration: 'none' }}>Arrays</Link></div>
                <div><Link to="/topics/Dynamic Programming" style={{ color: 'inherit', textDecoration: 'none' }}>DP</Link></div>
                <div><Link to="/topics/string" style={{ color: 'inherit', textDecoration: 'none' }}>Strings</Link></div>
                <div><Link to="/topics/tree" style={{ color: 'inherit', textDecoration: 'none' }}>Trees</Link></div>
                <div><Link to="/topics/graph" style={{ color: 'inherit', textDecoration: 'none' }}>Graphs</Link></div>
              </div>
            </li>
            <li className="nav-item">
              <Link to="/interview-roadmap" style={{ color: 'inherit', textDecoration: 'none' }}>Roadmap</Link>
            </li>
            <li className="nav-item">
              <Link to="/company-questions" style={{ color: 'inherit', textDecoration: 'none' }}>Companies</Link>
            </li>
            <li className="nav-item">
              <Link to="/daily" style={{ color: 'inherit', textDecoration: 'none' }}>Daily</Link>
            </li>

            {leetcodeUsername && (
              <li className="nav-item">
                <Link to="/progress" style={{ color: 'var(--accent-orange)', textDecoration: 'none' }}>Progress</Link>
              </li>
            )}

            <li className="nav-item">
              <Link to="/saved" style={{ color: 'inherit', textDecoration: 'none' }}>Saved</Link>
            </li>
          </ul>

          <form onSubmit={handleNavbarSearch} className="nav-search">
            <input
              type="text"
              placeholder="Search Q#"
              value={navbarSearch}
              onChange={(e) => setNavbarSearch(e.target.value)}
            />
          </form>
        </div>

        {/* Connect / User Button */}
        {leetcodeUsername ? (
          <div className="nav-item" style={{ marginLeft: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }} title="Connected to LeetCode">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: '#4db6ac', fontSize: '1.2rem' }}>●</span>
              <span style={{ fontWeight: 500, color: 'white' }}>{leetcodeUsername}</span>
            </div>

            <button
              onClick={() => syncWithLeetCode(leetcodeUsername)}
              disabled={isSyncing}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', opacity: isSyncing ? 0.5 : 1, padding: 0 }}
              title="Sync now"
            >
              {isSyncing ? '⏳' : '↻'}
            </button>

            <button
              onClick={disconnect}
              style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
              title="Disconnect"
            >
              (x)
            </button>
          </div>
        ) : (
          <button onClick={() => setShowConnectModal(true)} style={{
            background: 'transparent', border: '1px solid #444', color: '#ccc',
            padding: '0.4rem 0.8rem', borderRadius: '20px', marginLeft: '1rem', cursor: 'pointer'
          }}>
            Connect LeetCode
          </button>
        )}

        {/* Download Extension Button */}
        <button className="btn-download-ext" onClick={() => {
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
          if (isMobile) {
            alert("Extension works only on desktop browsers.\n\nSupported: Chrome, Edge, Brave");
          } else {
            window.open("https://chrome.google.com/webstore/detail/your-extension-id", "_blank");
          }
        }} title="Works on Chrome, Edge, Brave">
          <span className="icon">🧩</span> Download Extension
          <span className="subtitle">Get solutions inside LeetCode</span>
        </button>
      </nav>

      <div className="app-container" style={{ display: 'block', padding: 0 }}>
        {/* Helper CSS for Dropdown */}
        <style>{`
                    .dropdown { position: relative; display: inline-block; }
                    .dropdown-content {
                        display: none;
                        position: absolute;
                        background-color: #1a1a1a;
                        min-width: 120px;
                        box-shadow: 0 8px 16px rgba(0,0,0,0.2);
                        z-index: 100;
                        border-radius: 8px;
                        border: 1px solid #333;
                        top: 100%;
                        left: 0;
                    }
                    .dropdown:hover .dropdown-content { display: block; }
                    .dropdown-content div {
                        padding: 12px 16px;
                        display: block;
                        cursor: pointer;
                    }
                    .dropdown-content div:hover { background-color: #333; }
                `}</style>


        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/search/:questionId" element={<SearchPage savedVideos={savedVideos} onToggleSave={onToggleSave} />} />

          <Route path="/top-100-leetcode" element={<ListPage type="top-100" title="Top 100 Questions" savedVideos={savedVideos} onToggleSave={onToggleSave} />} />
          <Route path="/blind-75" element={<ListPage type="blind-75" title="Blind 75 Questions" savedVideos={savedVideos} onToggleSave={onToggleSave} />} />

          <Route path="/leetcode-easy" element={<ListPage type="difficulty" title="Easy Questions" param="Easy" savedVideos={savedVideos} onToggleSave={onToggleSave} />} />
          <Route path="/leetcode-medium" element={<ListPage type="difficulty" title="Medium Questions" param="Medium" savedVideos={savedVideos} onToggleSave={onToggleSave} />} />
          <Route path="/leetcode-hard" element={<ListPage type="difficulty" title="Hard Questions" param="Hard" savedVideos={savedVideos} onToggleSave={onToggleSave} />} />

          <Route path="/topics/:topic" element={<ListPage type="topic" savedVideos={savedVideos} onToggleSave={onToggleSave} />} />
          <Route path="/company/:company" element={<ListPage type="company" savedVideos={savedVideos} onToggleSave={onToggleSave} />} />

          <Route path="/interview-roadmap" element={<RoadmapPage />} />
          <Route path="/company-questions" element={<CompanyPage />} />
          <Route path="/daily" element={<DailyPage />} />

          <Route path="/saved" element={<SavedPage savedVideos={savedVideos} onToggleSave={onToggleSave} />} />
        </Routes>
      </div>

      <footer className="app-footer">
        <p>Created by <span className="creator-name">Vishwesh Shinde</span></p>
        <div className="footer-links">
          <a href="https://www.instagram.com/vishwesh_shinde" target="_blank" rel="noreferrer" className="footer-link">
            <span className="icon">📸</span> vishwesh_shinde
          </a>
          <span className="divider">|</span>
          <a href="https://www.linkedin.com/in/vishweshshinde" target="_blank" rel="noreferrer" className="footer-link">
            <span className="icon">💼</span> vishweshshinde
          </a>
        </div>
      </footer>
    </>
  );
}

function App() {
  const [savedVideos, setSavedVideos] = useState(() => {
    const saved = localStorage.getItem('savedVideos');
    return saved ? JSON.parse(saved) : [];
  });

  const handleToggleSave = (video) => {
    setSavedVideos(prev => {
      const exists = prev.find(v => v.id === video.id);
      let newSaved;
      if (exists) {
        newSaved = prev.filter(v => v.id !== video.id);
      } else {
        newSaved = [...prev, video];
      }
      localStorage.setItem('savedVideos', JSON.stringify(newSaved));
      return newSaved;
    });
  };

  return (
    <HelmetProvider>
      <SolvedProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <AppContent savedVideos={savedVideos} onToggleSave={handleToggleSave} />
          </BrowserRouter>
        </ErrorBoundary>
      </SolvedProvider>
    </HelmetProvider>
  );
}

export default App;
