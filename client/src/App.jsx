import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VideoCard from './components/VideoCard';
import './index.css';

// DevIcons URLs
const icons = {
  python: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  java: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg",
  cpp: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg",
  javascript: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  react: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  nodejs: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  go: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original-wordmark.svg",
  typescript: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg"
};

function App() {
  const [questionId, setQuestionId] = useState('');
  const [navbarSearch, setNavbarSearch] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('home'); // home, search, list, saved
  const [listTitle, setListTitle] = useState('');

  // Saved Videos State
  const [savedVideos, setSavedVideos] = useState(() => {
    const saved = localStorage.getItem('savedVideos');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('savedVideos', JSON.stringify(savedVideos));
  }, [savedVideos]);

  const handleToggleSave = (video) => {
    setSavedVideos(prev => {
      const isAlreadySaved = prev.some(v => v.id === video.id);

      if (isAlreadySaved) {
        // If clicking the ALREADY saved video, remove it (toggle off)
        return prev.filter(v => v.id !== video.id);
      } else {
        // If clicking a new video for this question, REPLACE the old one
        // Filter out any video with same questionId
        const othersRemoved = prev.filter(v => v.questionId !== video.questionId);
        return [...othersRemoved, video];
      }
    });
  };

  const isSaved = (videoId) => {
    return savedVideos.some(v => v.id === videoId);
  };

  // Search Logic
  const performSearch = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setVideos([]);
    setView('search');
    setListTitle(`Results for "${query}"`);
    setQuestionId(query);

    try {
      const response = await axios.get(`http://localhost:5000/api/search/${query}`);
      setVideos(response.data);
    } catch (err) {
      console.error(err);
      setError('Service unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleHeroSearch = (e) => {
    e.preventDefault();
    performSearch(questionId);
  };

  const handleNavbarSearch = (e) => {
    e.preventDefault();
    performSearch(navbarSearch);
  };

  // List (Top 100, Blind 75, Difficulty) Logic
  const fetchList = async (type, title, difficulty = '') => {
    setLoading(true);
    setError('');
    setVideos([]);
    setView('list');
    setListTitle(title);

    try {
      // Add difficulty query param if exists
      const url = `http://localhost:5000/api/list/${type}${difficulty ? `?difficulty=${difficulty}` : ''}`;
      const response = await axios.get(url);
      setVideos(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Saved View Logic
  const showSaved = () => {
    setView('saved');
    setListTitle('Saved Videos');
    setVideos(savedVideos.sort((a, b) => parseInt(a.questionId) - parseInt(b.questionId))); // Sort by Question Number
    setError('');
  };

  // Refresh saved view if active (when removing items)
  useEffect(() => {
    if (view === 'saved') {
      setVideos(savedVideos.sort((a, b) => parseInt(a.questionId) - parseInt(b.questionId)));
    }
  }, [savedVideos, view]);


  return (
    <>
      <div className="background-glow"></div>

      {/* Navbar */}
      <nav className={`navbar ${(view !== 'home' || videos.length > 0) ? 'has-results' : ''}`}>
        <div className="logo" onClick={() => { setView('home'); setQuestionId(''); setVideos([]); window.scrollTo(0, 0); }}>
          Leet<span>Vision</span>
        </div>

        <div className="nav-center">
          <ul className="nav-links">
            {/*<li className="nav-item" onClick={() => fetchList('top-100', 'Top 100 Questions')}>Top 100</li>
            <li className="nav-item" onClick={() => fetchList('important', 'Most Important')}>Most Important</li>
            <li className="nav-item" onClick={() => fetchList('blind-75', 'Blind 75')}>Blind 75</li>

            }
            <li className="nav-item dropdown">
              Difficulty ▾
              <div className="dropdown-content">
                <div onClick={() => fetchList('difficulty', 'Easy Questions', 'Easy')}>Easy</div>
                <div onClick={() => fetchList('difficulty', 'Medium Questions', 'Medium')}>Medium</div>
                <div onClick={() => fetchList('difficulty', 'Hard Questions', 'Hard')}>Hard</div>
              </div>
            </li>*/}

            <li className="nav-item" onClick={showSaved} style={{ color: 'var(--accent-orange)' }}>Saved</li>
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
                color: #ccc;
                padding: 12px 16px;
                text-decoration: none;
                display: block;
                cursor: pointer;
            }
            .dropdown-content div:hover { background-color: #333; color: white; }
        `}</style>


        {/* Hero Section - Only Visible on Home */}
        {view === 'home' && (
          <section className="hero-section">
            {/* Left Content */}
            <div className="hero-content">
              <h1 className="hero-title">
                Crack Code Interviews <br />
                <span>With Speed.</span>
              </h1>
              <p className="hero-subtitle">
                Stop wasting hours scrubbing through YouTube. <br />
                We index and verify the best LeetCode video solutions so you can master algorithms faster.
              </p>

              {/* Mobile-Only Search Box */}
              <form onSubmit={handleHeroSearch} className="hero-search-box mobile-hero-search">
                <input
                  type="text"
                  placeholder="Enter Question (e.g., 200)"
                  value={questionId}
                  onChange={(e) => setQuestionId(e.target.value)}
                />
                <button type="submit">Search</button>
              </form>

              <div className="hero-features desktop-only">
                <div className="feature-item"><span className="feature-icon">🚀</span><span>Instant Search</span></div>
                <div className="feature-item"><span className="feature-icon">🎯</span><span>Most Accurate</span></div>
                <div className="feature-item"><span className="feature-icon">💎</span><span>Curated Content</span></div>
              </div>

              <div className="desktop-only" style={{ marginTop: '2rem' }}>
                <button className="start-btn" onClick={() => document.querySelector('.nav-search input')?.focus()}>
                  Start Searching Above ↗
                </button>
              </div>
            </div>

            {/* Right Visual: Orbit Animation */}
            <div className="hero-visual">
              <div className="orbit-container">
                <div className="orbit orbit-1">
                  <div className="planet planet-1" style={{ transform: 'rotate(0deg) translate(150px) rotate(0deg)' }}><img src={icons.python} alt="Python" /></div>
                  <div className="planet planet-2" style={{ transform: 'rotate(180deg) translate(150px) rotate(-180deg)' }}><img src={icons.java} alt="Java" /></div>
                </div>
                <div className="orbit orbit-2">
                  <div className="planet planet-1" style={{ transform: 'rotate(90deg) translate(225px) rotate(-90deg)' }}><img src={icons.javascript} alt="JS" /></div>
                  <div className="planet planet-2" style={{ transform: 'rotate(210deg) translate(225px) rotate(-210deg)' }}><img src={icons.cpp} alt="C++" /></div>
                  <div className="planet planet-3" style={{ transform: 'rotate(330deg) translate(225px) rotate(-330deg)' }}><img src={icons.react} alt="React" /></div>
                </div>
                <div className="orbit orbit-3">
                  <div className="planet planet-1" style={{ transform: 'rotate(45deg) translate(300px) rotate(-45deg)' }}><img src={icons.go} alt="Go" /></div>
                  <div className="planet planet-2" style={{ transform: 'rotate(165deg) translate(300px) rotate(-165deg)' }}><img src={icons.typescript} alt="TS" /></div>
                  <div className="planet planet-3" style={{ transform: 'rotate(285deg) translate(300px) rotate(-285deg)' }}><img src={icons.nodejs} alt="Node" /></div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Results Section - Visible if View is not Home */}
        {view !== 'home' && (
          <section id="results-section" className="results-container">
            <h2 className="results-header">
              {listTitle}
            </h2>

            {loading && <div className="loading-container">Loading...</div>} {/* Simple text or skeleton */}

            {error && <div style={{ color: '#ff4444' }}>{error}</div>}

            {view === 'saved' && videos.length === 0 && !loading && (
              <div style={{ color: '#888', textAlign: 'center', marginTop: '2rem' }}>
                No saved videos yet. Start searching to add some!
              </div>
            )}

            <div className="results-grid">
              {loading && (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="video-card" style={{ height: '350px' }}>
                    <div className="skeleton" style={{ height: '60%', width: '100%' }}></div>
                    <div style={{ padding: '1rem' }}>
                      <div className="skeleton" style={{ height: '20px', width: '80%' }}></div>
                    </div>
                  </div>
                ))
              )}

              {!loading && videos.map((video, index) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isTopResult={(view === 'search' && index === 0) || view === 'list' || video.isMostAccurate} // Highlight top search result OR all list items (since they are curated bests)
                  isSaved={isSaved(video.id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Footer */}
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

export default App;
