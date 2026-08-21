import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SolvedProvider, useSolved } from './context/SolvedContext';
import { FaInstagram, FaLinkedin, FaSearch, FaTimes, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import ConnectModal from './components/ConnectModal';
import { Analytics } from "@vercel/analytics/react"
import './index.css';

// Components
import LandingPage from './components/LandingPage';
import ListPage from './components/ListPage';
import SearchPage from './components/SearchPage';
import SavedPage from './components/SavedPage';

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
import ConceptPage from './components/ConceptPage';
import UniversalExplore from './components/UniversalExplore';
import BasicToAdvancePage from './components/BasicToAdvancePage';
import BuyMeACoffeePage from './components/BuyMeACoffeePage';
import SponsorPage from './components/SponsorPage';

import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ReportSolutionPage from './components/ReportSolutionPage';
import AdminReports from './components/AdminReports';
import PricingPage from './components/PricingPage';
import CheckoutPage from './components/CheckoutPage';
import AdminSolutionEditor from './components/AdminSolutionEditor';
import AdminEmailCampaign from './components/AdminEmailCampaign';
import ResourcesPage from './components/ResourcesPage';
import EzoicRouteHandler from './components/EzoicRouteHandler';

function AppContent({ savedVideos, onToggleSave }) {
  const { user, logout } = useAuth();


  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { leetcodeUsername, disconnect, syncWithLeetCode, isSyncing } = useSolved();
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isHome = location.pathname === '/';
  const navbarClass = !isHome ? 'has-results' : '';

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    // Use regex to strictly check for positive integers
    if (query && /^\d+$/.test(query)) {
      navigate(`/solution/${query}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    } else {
      // Optional: Provide feedback or just do nothing as requested "nothing should be search"
      // For better UX, we could clear it or shake, but user said "nothing should be search".
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
            <li className="nav-item"><Link to="/basic-to-advance" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 400 }}>Roadmap</Link></li>

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

            <li className="nav-item"><Link to="/companies" style={{ color: 'inherit', textDecoration: 'none' }}>Companies</Link></li>
            <li className="nav-item"><Link to="/progress" style={{ color: 'var(--accent-orange)', textDecoration: 'none' }}>Progress</Link></li>
            <li className="nav-item"><a href="/docs" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}>Docs</a></li>
            <li className="nav-item"><Link to="/sponsor" style={{ color: '#f57c00', textDecoration: 'none', fontWeight: 600 }}>Sponsor</Link></li>

          </ul>

          {/* Navbar Search Integration */}
          <div className={`nav-search-container ${isSearchOpen ? 'active' : ''}`}>
            <div className="nav-search-form">
              <input
                type="text"
                placeholder="LeetCode Question No."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(e);
                  }
                }}
                autoFocus={isSearchOpen}
              />
              <button type="button" className="nav-search-btn" onClick={handleSearchSubmit}>
                <FaSearch />
              </button>
            </div>
            <button
              className="nav-search-toggle"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Toggle Search"
            >
              {isSearchOpen ? <FaTimes /> : <FaSearch />}
            </button>
          </div>

          {!user && (
            <Link to="/login" className="mobile-navbar-login">
              Log In
            </Link>
          )}
        </div>

        <div className="nav-auth">
          <a
            href="https://microsoftedge.microsoft.com/addons/detail/dogbidjabcbbhojhlnbfjilppgpenikb"
            target="_blank"
            rel="noreferrer"
            className="extension-nav-link"
          >
            Extension
          </a>
          {user ? (
            <div className="nav-user-profile dropdown">
              <div className="user-trigger">
                <FaUserCircle size={24} color="#ffa116" />
                <span className="user-name">{user.name.split(' ')[0]}</span>
              </div>
              <div className="dropdown-content user-dropdown">
                <div style={{ padding: '10px 15px', borderBottom: '1px solid #333', color: '#888', fontSize: '0.85rem' }}>
                  {user.email}
                </div>
                {/* <div><Link to="/profile">Profile</Link></div> */}
                <div onClick={logout} style={{ color: '#ff4444' }}>
                  <FaSignOutAlt style={{ marginRight: '8px' }} /> Logout
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-btn">Log In</Link>
            </div>
          )}
        </div>

        {/* Mobile Actions: Menu */}
        <div className="mobile-actions">
          {leetcodeUsername && (
            <div className="nav-item desktop-only-user" title="Connected">
              <span style={{ color: '#4db6ac', fontSize: '1.2rem' }}>●</span>
            </div>
          )}

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
            {user ? (
              <div className="mobile-account-section">
                <div className="mobile-user-info" style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '10px' }}>
                  <FaUserCircle size={32} color="#ffa116" />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                  </div>
                </div>
                <div className="mobile-link" onClick={() => { logout(); setIsMobileMenuOpen(false); }} style={{ color: '#ff4444', display: 'flex', alignItems: 'center' }}>
                  <FaSignOutAlt style={{ marginRight: '8px' }} /> Logout
                </div>
                <div className="mobile-divider">Navigation</div>
              </div>
            ) : (
              <div className="mobile-account-section">
                <Link to="/login" className="mobile-link" style={{ background: '#ffa116', color: 'black', fontWeight: 700, textAlign: 'center', borderRadius: '8px', marginBottom: '15px' }} onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
                <div className="mobile-divider">Navigation</div>
              </div>
            )}
            <Link to="/top-100-leetcode" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Top 100 Questions</Link>
            <Link to="/basic-to-advance" className="mobile-link highlight" style={{ color: '#4db6ac' }} onClick={() => setIsMobileMenuOpen(false)}>Basic to Advance Roadmap</Link>

            <Link to="/companies" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Companies</Link>
            <Link to="/progress" className="mobile-link highlight" onClick={() => setIsMobileMenuOpen(false)}>Progress Tracking</Link>
            <a href="/docs" className="mobile-link highlight" style={{ color: '#ffa116' }} onClick={() => setIsMobileMenuOpen(false)}>DSA Docs</a>

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
            <Link to="/sponsor" className="mobile-link" style={{ color: '#f57c00', fontWeight: 600 }} onClick={() => setIsMobileMenuOpen(false)}>⭐ Sponsor LeetVision</Link>
            <Link to="/daily" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Daily Challenge</Link>
            <Link to="/saved" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Saved Videos</Link>
          </div>
        </div>
      </nav>

      <div className="app-container" style={{ display: 'block' }}>
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
              color: white;
              text-decoration: none;
          }
          .dropdown-content div:hover { background-color: #333; }
          
          /* Auth Styles */
          .nav-auth { margin-left: 20px; display: flex; align-items: center; }
          .auth-buttons { display: flex; gap: 12px; }
          .login-btn {
              padding: 8px 16px;
              border-radius: 8px;
              color: #ccc;
              text-decoration: none;
              font-weight: 600;
              transition: 0.2s;
          }
          .login-btn:hover { color: white; background: rgba(255,255,255,0.1); }
          .signup-btn {
              padding: 8px 16px;
              border-radius: 8px;
              background: #ffa116;
              color: black;
              text-decoration: none;
              font-weight: 700;
              transition: 0.2s;
          }
          .signup-btn:hover { background: #ffbe4d; transform: translateY(-1px); }

          .nav-user-profile { cursor: pointer; }
          .user-trigger { display: flex; align-items: center; gap: 8px; padding: 4px; }
          .user-name { font-weight: 600; font-size: 0.95rem; }
          .user-dropdown { right: 0; left: auto; min-width: 180px; }
          
          @media (max-width: 768px) {
              .nav-auth { display: none; } /* Hide on mobile, move to menu if needed */
              
              .mobile-navbar-login {
                  display: block;
                  background: var(--accent-orange);
                  color: white !important;
                  padding: 6px 16px;
                  border-radius: 20px;
                  font-size: 0.85rem;
                  font-weight: 700;
                  text-decoration: none;
                  margin-left: 10px;
                  box-shadow: 0 4px 12px rgba(245, 124, 0, 0.2);
              }
          }

          @media (min-width: 769px) {
              .mobile-navbar-login { display: none; }
          }
        `}</style>

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/search/:questionId" element={<SearchPage savedVideos={savedVideos} onToggleSave={onToggleSave} />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/solution/:id" element={<SolutionPage />} />
          <Route path="/top-100-leetcode" element={<ListPage type="top-100" title="Top 100 Liked Questions" savedVideos={savedVideos} onToggleSave={onToggleSave} />} />
          <Route path="/basic-to-advance" element={<BasicToAdvancePage />} />

          <Route path="/leetcode-easy" element={<ListPage type="difficulty" title="Easy Questions" param="Easy" savedVideos={savedVideos} onToggleSave={onToggleSave} />} />
          <Route path="/leetcode-medium" element={<ListPage type="difficulty" title="Medium Questions" param="Medium" savedVideos={savedVideos} onToggleSave={onToggleSave} />} />
          <Route path="/leetcode-hard" element={<ListPage type="difficulty" title="Hard Questions" param="Hard" savedVideos={savedVideos} onToggleSave={onToggleSave} />} />
          <Route path="/topics/:topic" element={<ListPage type="topic" savedVideos={savedVideos} onToggleSave={onToggleSave} />} />
          <Route path="/company/:company" element={<CompanyPrepPage savedVideos={savedVideos} onToggleSave={onToggleSave} />} />

          <Route path="/companies" element={<CompanyListingPage />} />
          <Route path="/company-questions/:companyName" element={<CompanyDetailPage />} />
          <Route path="/company-questions" element={<CompanyPage />} />
          <Route path="/daily" element={<DailyPage />} />
          <Route path="/saved" element={<SavedPage savedVideos={savedVideos} onToggleSave={onToggleSave} />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/daily-tech" element={<DailyTechPage />} />
          <Route path="/concept/:id" element={<ConceptPage />} />
          <Route path="/universe/solution/:platform/:slug" element={<ConceptPage />} />
          <Route path="/report-solution" element={<ReportSolutionPage />} />
          <Route path="/explore" element={<UniversalExplore />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/buy-me-a-coffee" element={<BuyMeACoffeePage />} />
          <Route path="/sponsor" element={<SponsorPage />} />
          <Route path="/sponsor-us" element={<SponsorPage />} />

          {/* Admin Routes */}
          <Route path="/admin/edit-solution/:id" element={<AdminSolutionEditor />} />
          <Route path="/admin/add-solution/:id" element={<AdminSolutionEditor />} />
          <Route path="/admin/add-solution" element={<AdminSolutionEditor />} />
          <Route path="/admin/campaign" element={<AdminEmailCampaign />} />
          <Route path="/resources" element={<ResourcesPage />} />
        </Routes>
      </div>

      {!isHome && (
        <footer className="app-footer">
          <p>Created by <span className="creator-name">Vishwesh Shinde</span></p>
          <div className="footer-links">
            <Link to="/about" className="footer-link">About</Link>
            <Link to="/docs" className="footer-link">Docs</Link>
            <Link to="/how-it-works" className="footer-link">How it Works</Link>
            <Link to="/sponsor" className="footer-link" style={{ color: '#f57c00', fontWeight: 600 }}>Sponsor Us</Link>
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
      )}
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
      <AuthProvider>
        <SolvedProvider>
          <BrowserRouter>
            <EzoicRouteHandler />
            <AppContent savedVideos={savedVideos} onToggleSave={handleToggleSave} />
            <Analytics />
          </BrowserRouter>
        </SolvedProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
