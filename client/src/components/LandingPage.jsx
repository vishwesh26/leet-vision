import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlayCircle, FaChartLine, FaBuilding, FaCode, FaArrowRight, FaTimes } from 'react-icons/fa';
import SEO from './SEO';

const LandingPage = () => {
    const [showNote, setShowNote] = useState(true);

    return (
        <>
            <SEO title="LeetVision - Visual Coding Preparation Platform" description="Master Data Structures and Algorithms with curated video solutions, company-specific plans, and progress tracking." path="/" />

            {/* Custom Styles for Animation and Premium UI */}
            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                
                .premium-grid-bg {
                    background-size: 40px 40px;
                    background-image: linear-gradient(to right, rgba(255, 161, 22, 0.05) 1px, transparent 1px),
                                      linear-gradient(to bottom, rgba(255, 161, 22, 0.05) 1px, transparent 1px);
                    mask-image: radial-gradient(circle at center, black 40%, transparent 80%);
                }
                
                .minimal-card {
                    background: #111;
                    border: 1px solid #222;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                .minimal-card:hover {
                    border-color: var(--accent-orange);
                    transform: translateY(-5px);
                    background: rgba(255, 161, 22, 0.03);
                    box-shadow: 0 10px 40px -10px rgba(255, 161, 22, 0.2);
                }

                .hero-text-gradient {
                    background: linear-gradient(135deg, #fff 0%, #ffa116 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    filter: drop-shadow(0 0 20px rgba(255, 161, 22, 0.3));
                }
                
                .glow-spotlight {
                    position: absolute;
                    top: -20%;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, rgba(255, 161, 22, 0.15) 0%, transparent 70%);
                    filter: blur(80px);
                    z-index: 0;
                    pointer-events: none;
                }

                @keyframes bounceIn {
                    0% { opacity: 0; transform: translateY(-20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }

                .sticky-note-arrow {
                    position: absolute;
                    top: -15px;
                    right: 40px;
                    width: 0; 
                    height: 0; 
                    border-left: 10px solid transparent;
                    border-right: 10px solid transparent;
                    border-bottom: 15px solid rgba(30, 30, 30, 0.95);
                }

            `}</style>

            <div className="landing-container" style={{ background: '#050505', minHeight: '100vh', color: 'white', overflowX: 'hidden', position: 'relative' }}>

                {/* Background Decor */}
                <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
                    <div className="premium-grid-bg" style={{ position: 'absolute', inset: 0 }}></div>
                    <div className="glow-spotlight"></div>
                </div>

                {/* Sticky Note for Extension (Desktop Only) */}
                {showNote && (
                    <div className="desktop-only" style={{
                        position: 'fixed',
                        top: '80px', /* Moved down slightly */
                        right: '15px', /* Moved right to align with button edge */
                        width: '240px', /* Smaller width */
                        background: '#111',
                        border: '1px solid var(--accent-orange)',
                        color: '#eee',
                        padding: '1rem 1rem 1rem 1.5rem', /* Extra left padding for close btn? No, absolute positioning. */
                        zIndex: 1000,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        animation: 'bounceIn 0.8s ease-out forwards 0.5s',
                        opacity: 0,
                        fontFamily: '"Caveat", cursive',
                        transform: 'rotate(-2deg)',
                        borderRadius: '2px 2px 20px 2px',
                    }}>
                        {/* Close Button (Left Side) */}
                        <div
                            onClick={() => setShowNote(false)}
                            style={{
                                position: 'absolute',
                                top: '5px',
                                left: '5px',
                                cursor: 'pointer',
                                color: '#666',
                                transition: 'color 0.2s',
                                zIndex: 10,
                                padding: '2px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-orange)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                            title="Close Note"
                        >
                            <FaTimes size={12} />
                        </div>

                        {/* Shadow for folded corner */}
                        <div style={{
                            content: '""',
                            position: 'absolute',
                            bottom: '15px',
                            right: '5px',
                            width: '20px', /* Smaller fold */
                            height: '20px',
                            background: 'linear-gradient(135deg, transparent 50%, rgba(255, 161, 22, 0.2) 50%)',
                            zIndex: -1,
                        }}></div>

                        {/* Arrow pointing up (Dark) - Aligned to button center approx */}
                        <div style={{
                            position: 'absolute',
                            top: '-15px',
                            left: '20px', /* Moved to Left */
                            width: '0',
                            height: '0',
                            borderLeft: '10px solid transparent', /* Smaller arrow */
                            borderRight: '10px solid transparent',
                            borderBottom: '15px solid var(--accent-orange)',
                        }}></div>
                        <div style={{
                            position: 'absolute',
                            top: '-13px',
                            left: '20px', /* Moved to Left */
                            width: '0',
                            height: '0',
                            borderLeft: '10px solid transparent',
                            borderRight: '10px solid transparent',
                            borderBottom: '15px solid #111',
                        }}></div>

                        <h4 style={{ margin: '0 0 0.25rem', fontWeight: '700', fontSize: '1.4rem', lineHeight: '1', color: 'var(--accent-orange)' }}>
                            Hey There! 👋
                        </h4>
                        <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: '1.2', fontWeight: '500' }}>
                            Download the extension to watch video solutions directly on the <strong>LeetCode website itself</strong>!
                            <br />
                            <span style={{ fontSize: '0.9rem', color: '#ff6b6b', fontWeight: 'bold' }}>* Compatible with Edge Browser only</span>
                            <span style={{ display: 'block', marginTop: '5px', fontSize: '1rem', color: '#888' }}>
                                &uarr; Click the button to get started!
                            </span>
                        </p>
                    </div>
                )}

                {/* Hero Section */}
                <section style={{
                    position: 'relative',
                    padding: '0rem 2rem 4rem',
                    textAlign: 'center',
                    zIndex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '80vh'
                }}>

                    <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 14px',
                            borderRadius: '30px',
                            background: 'rgba(255, 161, 22, 0.1)',
                            color: 'var(--accent-orange)',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            marginBottom: '2rem',
                            border: '1px solid rgba(255, 161, 22, 0.2)',
                            boxShadow: '0 0 20px rgba(255, 161, 22, 0.1)'
                        }}>
                            <span style={{ width: '6px', height: '6px', background: 'var(--accent-orange)', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 10px var(--accent-orange)' }}></span>
                            Visual Coding Interview Prep
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(3rem, 6vw, 5rem)',
                            lineHeight: '1.1',
                            marginBottom: '1.5rem',
                            fontWeight: '800',
                            letterSpacing: '-2px',
                            color: 'white'
                        }}>
                            Clarify Your <br />
                            <span className="hero-text-gradient">Code Vision</span>
                        </h1>

                        <p style={{
                            fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
                            color: '#aaa',
                            maxWidth: '650px',
                            margin: '0 auto 3rem',
                            lineHeight: '1.6',
                            fontWeight: '400',
                            textShadow: '0 2px 10px rgba(0,0,0,0.8)' /* Shadow for readability against orbits */
                        }}>
                            Master algorithms with <strong style={{ color: 'var(--accent-orange)' }}>visual explanations</strong>. <br />
                            No noise. Just clear, curated paths to success.
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                            <Link to="/top-100-leetcode" style={{
                                padding: '1rem 3rem',
                                background: 'var(--accent-orange)',
                                color: 'white',
                                fontWeight: 'bold',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                boxShadow: '0 0 30px rgba(255, 161, 22, 0.4)',
                                transition: 'all 0.2s ease',
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 0 40px rgba(255, 161, 22, 0.6)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 161, 22, 0.4)';
                                }}
                            >
                                Start Solving <FaArrowRight />
                            </Link>

                            <Link to="/company-questions" style={{
                                padding: '1rem 3rem',
                                background: 'rgba(5,5,5,0.6)', /* Semi-transparent back for readability */
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                fontWeight: '500',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                textDecoration: 'none',
                                border: '1px solid #333',
                                transition: 'all 0.2s ease'
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'var(--accent-orange)';
                                    e.currentTarget.style.color = 'var(--accent-orange)';
                                    e.currentTarget.style.background = 'rgba(255,161,22,0.05)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = '#333';
                                    e.currentTarget.style.color = 'white';
                                    e.currentTarget.style.background = 'rgba(5,5,5,0.6)';
                                }}
                            >
                                Explore Companies
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section style={{ padding: '6rem 2rem', maxWidth: '1300px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: '600', letterSpacing: '-1px' }}>Everything you need.</h2>
                        <p style={{ color: '#666' }}>Focused tools for efficient preparation.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>

                        {/* Feature 1 */}
                        <div className="minimal-card" style={{ padding: '2.5rem', borderRadius: '12px' }}>
                            <div style={{ marginBottom: '1.5rem', color: 'var(--accent-orange)' }}>
                                <FaBuilding style={{ fontSize: '1.5rem' }} />
                            </div>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>Company Hubs</h3>
                            <p style={{ color: '#aaa', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                Targeted preparation plans for top tech companies. Curated experience-based roadmaps.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="minimal-card" style={{ padding: '2.5rem', borderRadius: '12px' }}>
                            <div style={{ marginBottom: '1.5rem', color: '#4db6ac' }}>
                                <FaPlayCircle style={{ fontSize: '1.5rem' }} />
                            </div>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>Visual Solutions</h3>
                            <p style={{ color: '#aaa', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                High-quality video explanations for every problem. Understand the logic, not just the code.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="minimal-card" style={{ padding: '2.5rem', borderRadius: '12px' }}>
                            <div style={{ marginBottom: '1.5rem', color: '#6464ff' }}>
                                <FaChartLine style={{ fontSize: '1.5rem' }} />
                            </div>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>Progress Tracking</h3>
                            <p style={{ color: '#aaa', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                Visualize your consistency and mastery across data structures and algorithms.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="minimal-card" style={{ padding: '2.5rem', borderRadius: '12px' }}>
                            <div style={{ marginBottom: '1.5rem', color: '#ff6464' }}>
                                <FaCode style={{ fontSize: '1.5rem' }} />
                            </div>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>Daily Challenges</h3>
                            <p style={{ color: '#aaa', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                Build a habit with a daily curated problem. Stay sharp with regular practice.
                            </p>
                        </div>

                    </div>
                </section>

                {/* Footer */}
                <footer style={{ padding: '3rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', color: '#555', position: 'relative', zIndex: 1 }}>
                    <p style={{ marginBottom: '0.5rem' }}>&copy; 2026 LeetVision. Built for developers, by developers.</p>
                    <p style={{ fontSize: '0.8rem' }}>Helping you clear the noise and focus on the code.</p>
                </footer>

            </div>
        </>
    );
};

export default LandingPage;
