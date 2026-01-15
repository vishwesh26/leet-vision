import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSolved } from '../context/SolvedContext';
import SEO from './SEO';

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

const HomePage = () => {
    const navigate = useNavigate();
    const { leetcodeUsername } = useSolved();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search/${searchQuery}`);
        }
    };

    return (
        <>
            <SEO title="LeetVision - Visual LeetCode Solutions" description="Find visual solutions for LeetCode problems instantly." path="/" />
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
                    <form onSubmit={handleSearch} className="hero-search-box mobile-hero-search">
                        <input
                            type="text"
                            placeholder="Enter Question (e.g., 200)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
        </>
    );
};

export default HomePage;
