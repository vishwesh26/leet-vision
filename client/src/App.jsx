import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SolvedProvider, useSolved } from './context/SolvedContext';
import { FaInstagram, FaLinkedin, FaSearch, FaTimes } from 'react-icons/fa';
import ConnectModal from './components/ConnectModal';
import { Analytics } from "@vercel/analytics/react"
import './index.css';

// Components
// Components
import LandingPage from './components/LandingPage';

import ListPage from './components/ListPage';
import SearchPage from './components/SearchPage';
import SavedPage from './components/SavedPage';
import RoadmapPage from './components/RoadmapPage';
import DailyPage from './components/DailyPage';
import CompanyPrepPage from './components/CompanyPrepPage';
import ProgressPage from './components/ProgressPage';
import CompanyPage from './components/CompanyPage';
import ErrorBoundary from './components/ErrorBoundary';
import SolutionPage from './components/SolutionPage';
import About from './components/About';
import HowItWorks from './components/HowItWorks';
import PrivacyPolicy from './components/PrivacyPolicy';
import Terms from './components/Terms';
import Contact from './components/Contact';
import BlogList from './components/BlogList';
import BlogPost from './components/BlogPost';
import DailyTechPage from './components/DailyTechPage';
import CompanyListingPage from './components/CompanyListingPage';
import CompanyDetailPage from './components/CompanyDetailPage';

function AppContent({ savedVideos, onToggleSave }) {
  // Helper to close mobile menu or handle extensive nav logic if needed

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile Menu State
  const navigate = useNavigate();
  const location = useLocation();

  const { leetcodeUsername, disconnect, syncWithLeetCode, isSyncing } = useSolved();
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Determine if we should show 'has-results' style (solid background) on navbar
  // If not on Home OR if on Home but scrolled down (handled by CSS sticky? No, original had JS Logic)
  // Original logic: view !== 'home' 
  const isHome = location.pathname === '/';
  const navbarClass = !isHome ? 'has-results' : '';

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/solution/${searchQuery.trim()}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <div className="background-glow"></div>

      {showConnectModal && <ConnectModal onClose={() => setShowConnectModal(false)} />}

      <nav className={`navbar ${navbarClass}`}>
        <div className="logo" onClick={() => navigate('/')}>
          Leet<span>Vision</span>
        </div>

        <div className="nav-center">
          <ul className="nav-links">
            <li className="nav-item"><Link to="/top-100-leetcode" style={{ color: 'inherit', textDecoration: 'none' }}>Top 100</Link></li>
            <li className="nav-item"><Link to="/blind-75" style={{ color: 'inherit', textDecoration: 'none' }}>Blind 75</Link></li>
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
            <li className="nav-item"><Link to="/interview-roadmap" style={{ color: 'inherit', textDecoration: 'none' }}>Roadmap</Link></li>
            <li className="nav-item"><Link to="/companies" style={{ color: 'inherit', textDecoration: 'none' }}>Companies</Link></li>
            <li className="nav-item"><Link to="/daily" style={{ color: 'inherit', textDecoration: 'none' }}>Daily</Link></li>
            <li className="nav-item"><Link to="/progress" style={{ color: 'var(--accent-orange)', textDecoration: 'none' }}>My Progress</Link></li>
            <li className="nav-item"><Link to="/saved" style={{ color: 'inherit', textDecoration: 'none' }}>Saved</Link></li>
            <li className="nav-item"><Link to="/daily-tech" style={{ color: 'var(--accent-orange)', textDecoration: 'none', fontWeight: 600 }}>Daily Tech</Link></li>
            <li className="nav-item"><Link to="/blog" style={{ color: 'inherit', textDecoration: 'none' }}>Blog</Link></li>
          </ul>

          {/* Download Extension Button (Desktop Only) */}
          <a
            href="https://microsoftedge.microsoft.com/addons/detail/dogbidjabcbbhojhlnbfjilppgpenikb"
            target="_blank"
            rel="noreferrer"
            className="download-extension-btn"
          >
            Download Extension
          </a>

          {/* Navbar Search Integration */}
          <div className={`nav-search-container ${isSearchOpen ? 'active' : ''}`}>
            <form onSubmit={handleSearchSubmit} className="nav-search-form">
              <input
                type="text"
                placeholder="question no. eg. 12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus={isSearchOpen}
              />
              <button type="submit" className="nav-search-btn">
                <FaSearch />
              </button>
            </form>
            <button
              className="nav-search-toggle"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Toggle Search"
            >
              {isSearchOpen ? <FaTimes /> : <FaSearch />}
            </button>
          </div>
        </div>

        {/* Mobile Actions: Menu */}
        <div className="mobile-actions">

          {/* Connect / User Button */}
          {leetcodeUsername ? (
            <div className="nav-item desktop-only-user" title="Connected">
              <span style={{ color: '#4db6ac', fontSize: '1.2rem' }}>●</span>
              {/* Simplified user display for desktop, hidden on mobile in this simplified view if needed, 
                         or we keep it but it might be crowded. Let's rely on CSS to hide 'desktop-only-user' on mobile if crowded. */}
            </div>
          ) : (null)}

          {/* Mobile Hamburger Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <span className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`bar ${isMobileMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>


        {/* Mobile Menu Overlay */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-content">
            <Link to="/top-100-leetcode" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Top 100 Questions</Link>
            <Link to="/blind-75" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Blind 75 List</Link>
            <Link to="/progress" className="mobile-link highlight" onClick={() => setIsMobileMenuOpen(false)}>My Progress</Link>

            <div className="mobile-divider">Difficulty</div>
            <Link to="/leetcode-easy" className="mobile-link sub" onClick={() => setIsMobileMenuOpen(false)}>Easy</Link>
            <Link to="/leetcode-medium" className="mobile-link sub" onClick={() => setIsMobileMenuOpen(false)}>Medium</Link>
            <Link to="/leetcode-hard" className="mobile-link sub" onClick={() => setIsMobileMenuOpen(false)}>Hard</Link>

            <div className="mobile-divider">Topics</div>
            <Link to="/topics/array" className="mobile-link sub" onClick={() => setIsMobileMenuOpen(false)}>Arrays</Link>
            <Link to="/topics/Dynamic Programming" className="mobile-link sub" onClick={() => setIsMobileMenuOpen(false)}>DP</Link>
            <Link to="/topics/string" className="mobile-link sub" onClick={() => setIsMobileMenuOpen(false)}>Strings</Link>
            <Link to="/topics/tree" className="mobile-link sub" onClick={() => setIsMobileMenuOpen(false)}>Trees</Link>
            <Link to="/topics/graph" className="mobile-link sub" onClick={() => setIsMobileMenuOpen(false)}>Graphs</Link>

            <div className="mobile-divider">Companies</div>
            <Link to="/companies" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Browse All Companies</Link>

            <div className="mobile-divider">More</div>
            <Link to="/interview-roadmap" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Roadmap</Link>
            <Link to="/daily" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Daily Challenge</Link>
            <Link to="/saved" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Saved Videos</Link>
          </div>
        </div>
      </nav >

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
          {/* New Landing Page at Root */}
          <Route path="/" element={<LandingPage />} />


          {/* Video / Search Result Page */}
          <Route path="/search/:questionId" element={<SearchPage savedVideos={savedVideos} onToggleSave={onToggleSave} />} />

          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/solution/:id" element={<SolutionPage />} />


          <Route path="/top-100-leetcode" element={<ListPage type="top-100" title="Top 100 Liked Questions" savedVideos={savedVideos} onToggleSave={onToggleSave} />} />
          <Route path="/blind-75" element={<ListPage type="blind-75" title="Blind 75 Questions" savedVideos={savedVideos} onToggleSave={onToggleSave} />} />

          <Route path="/leetcode-easy" element={<ListPage type="difficulty" title="Easy Questions" param="Easy" savedVideos={savedVideos} onToggleSave={onToggleSave} />} />
          <Route path="/leetcode-medium" element={<ListPage type="difficulty" title="Medium Questions" param="Medium" savedVideos={savedVideos} onToggleSave={onToggleSave} />} />
          <Route path="/leetcode-hard" element={<ListPage type="difficulty" title="Hard Questions" param="Hard" savedVideos={savedVideos} onToggleSave={onToggleSave} />} />

          <Route path="/topics/:topic" element={<ListPage type="topic" savedVideos={savedVideos} onToggleSave={onToggleSave} />} />
          <Route path="/company/:company" element={<CompanyPrepPage savedVideos={savedVideos} onToggleSave={onToggleSave} />} />

          <Route path="/interview-roadmap" element={<RoadmapPage />} />
          <Route path="/companies" element={<CompanyListingPage />} />
          <Route path="/company-questions/:companyName" element={<CompanyDetailPage />} />
          <Route path="/company-questions" element={<CompanyPage />} />
          <Route path="/daily" element={<DailyPage />} />

          <Route path="/saved" element={<SavedPage savedVideos={savedVideos} onToggleSave={onToggleSave} />} />

          {/* AdSense Content Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/daily-tech" element={<DailyTechPage />} />
        </Routes>
      </div>

      <footer className="app-footer">
        <p>Created by <span className="creator-name">Vishwesh Shinde</span></p>
        <div className="footer-links">
          <Link to="/about" className="footer-link">About</Link>
          <Link to="/how-it-works" className="footer-link">How it Works</Link>
          <Link to="/daily-tech" className="footer-link">Daily Tech</Link>
          <Link to="/blog" className="footer-link">Blog & Guides</Link>
          <Link to="/contact" className="footer-link">Contact</Link>
          <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link>
          <Link to="/terms" className="footer-link">Terms</Link>
        </div>
        <div className="footer-socials" style={{ marginTop: '1rem' }}>
          <a href="https://www.instagram.com/vishwesh_shinde" target="_blank" rel="noreferrer" className="footer-icon-link" style={{ marginRight: '1rem' }}>
            <FaInstagram size={20} />
          </a>
          <a href="https://www.linkedin.com/in/vishweshshinde" target="_blank" rel="noreferrer" className="footer-icon-link">
            <FaLinkedin size={20} />
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
            <Analytics />
          </BrowserRouter>
        </ErrorBoundary>
      </SolvedProvider>
    </HelmetProvider>
  );
}

export default App;
