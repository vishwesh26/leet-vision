import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from './SEO';
import AdSenseContainer from './AdSenseContainer';

const DailyPage = () => {
    const [dailyProblem, setDailyProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [revealed, setRevealed] = useState(false);
    const navigate = useNavigate();

    // Fetch Daily Challenge
    useEffect(() => {
        const fetchDaily = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_URL || '';
                const res = await fetch(`${API_BASE}/api/daily-challenge`);
                if (res.ok) {
                    const data = await res.json();
                    setDailyProblem(data);
                }
            } catch (err) {
                console.error("Failed to fetch daily challenge", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDaily();
    }, []);

    if (loading) {
        return (
            <div style={{ minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888' }}>
                Loading Daily Challenge...
            </div>
        );
    }

    if (!dailyProblem) {
        return (
            <div style={{ minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#ff4444' }}>
                Failed to load daily challenge. Please try again later.
            </div>
        );
    }

    return (
        <>
            <SEO title="Daily Challenge" description={`Solve today's challenge: ${dailyProblem.title}`} path="/daily" />
            <div className="daily-container" style={{
                minHeight: '70vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <div className="glow-circle" style={{
                    width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(245,124,0,0.2) 0%, transparent 70%)',
                    position: 'absolute', zIndex: -1
                }}></div>

                <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Daily Challenge</h1>
                <p style={{ color: '#888', marginBottom: '3rem' }}>{new Date().toLocaleDateString()}</p>

                <div className="daily-card" style={{
                    background: '#161616',
                    border: '1px solid #333',
                    padding: '3rem',
                    borderRadius: '20px',
                    maxWidth: '600px',
                    width: '100%',
                    position: 'relative'
                }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--accent-orange)' }}>{dailyProblem.id}.</span> {dailyProblem.title}
                    </h2>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
                        <span className={`badge-difficulty ${dailyProblem.difficulty?.toLowerCase()}`} style={{ padding: '0.4rem 1rem', borderRadius: '50px' }}>
                            {dailyProblem.difficulty}
                        </span>
                        {/* If topics exist, show first one */}
                        {dailyProblem.topics && dailyProblem.topics.length > 0 && (
                            <span className="badge" style={{ background: '#333', color: '#ccc', padding: '0.4rem 1rem', borderRadius: '50px' }}>
                                {dailyProblem.topics[0]}
                            </span>
                        )}
                    </div>

                    {!revealed ? (
                        <div className="reveal-section">
                            <p style={{ marginBottom: '2rem', color: '#aaa' }}>Have you tried solving it yourself first?</p>
                            <button onClick={() => setRevealed(true)} style={{
                                background: 'var(--accent-orange)',
                                color: 'white',
                                border: 'none',
                                padding: '1rem 2.5rem',
                                fontSize: '1.1rem',
                                borderRadius: '50px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}>
                                I Tried, Show Solution
                            </button>
                            <div style={{ marginTop: '1.5rem' }}>
                                <a href={dailyProblem.slug ? `https://leetcode.com/problems/${dailyProblem.slug}` : '#'} target="_blank" rel="noreferrer" style={{ color: '#888', textDecoration: 'underline' }}>
                                    Go to LeetCode Problem
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="video-reveal" style={{ animation: 'fadeIn 0.5s ease' }}>
                            <Link to={`/search/${dailyProblem.id}`} style={{
                                textDecoration: 'none'
                            }}>
                                <div style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    color: 'white',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <span style={{ fontSize: '2rem' }}>▶</span>
                                    <span>Watch Explanation Video</span>
                                </div>
                            </Link>
                            <p style={{ marginTop: '1rem', color: '#4caf50' }}>Good job attempting it!</p>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '4rem', width: '100%', maxWidth: '600px' }}>
                    <AdSenseContainer slot="8240394871" />
                </div>
            </div>
        </>
    );
};

export default DailyPage;
