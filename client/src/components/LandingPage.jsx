import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaTimes } from 'react-icons/fa';
import { SiLeetcode, SiHackerrank, SiGeeksforgeeks, SiCodechef } from 'react-icons/si';
import axios from 'axios';
import SEO from './SEO';


const LandingPage = () => {
    const navigate = useNavigate();
    const [showNote, setShowNote] = useState(true);
    useEffect(() => {
        // Survey removed
    }, []);

    const platforms = [
        { name: 'LEETCODE', icon: <SiLeetcode /> },
        { name: 'GEEKSFORGEEKS', icon: <SiGeeksforgeeks /> },
        { name: 'CODECHEF', icon: <SiCodechef /> },
        { name: 'HACKERRANK', icon: <SiHackerrank /> }
    ];

    return (
        <div className="landing-v2" style={{ position: 'relative', overflowX: 'hidden' }}>
            <SEO title="LeetVision - Visual Coding Preparation Platform" description="Master Data Structures and Algorithms with curated video solutions, company-specific plans, and progress tracking." path="/" />

            {/* Premium Background */}
            <div className="grid-bg" style={{ position: 'fixed', inset: 0, zIndex: 0 }}></div>

            {/* Background Glows & Particles */}
            <div className="hero-glow" style={{ top: '10%', left: '10%' }}></div>
            <div className="hero-glow" style={{ bottom: '10%', right: '10%', background: 'radial-gradient(circle, rgba(100, 100, 255, 0.1) 0%, transparent 70%)' }}></div>

            {/* Animated Particles (Digital Pulses) */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="float-slow" style={{
                        position: 'absolute',
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        width: '1px',
                        height: '1px',
                        background: i % 2 === 0 ? 'var(--accent-orange)' : 'white',
                        boxShadow: `0 0 5px ${i % 2 === 0 ? 'var(--accent-orange)' : 'white'}`,
                        borderRadius: '50%',
                        opacity: 0.2,
                        animationDelay: `${i * 1.2}s`,
                        animationDuration: `${5 + Math.random() * 5}s`
                    }}></div>
                ))}
            </div>

            {/* Sticky Note for Extension (Desktop Only) */}
            {showNote && (
                <div
                    className="desktop-only"
                    style={{
                        position: 'fixed',
                        top: '100px',
                        right: '2rem',
                        width: '240px',
                        background: '#111',
                        border: '1px solid var(--accent-orange)',
                        padding: '1.5rem',
                        zIndex: 1000,
                        borderRadius: '2px 2px 20px 2px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                        transform: 'rotate(-2deg)'
                    }}>
                    <button onClick={() => setShowNote(false)} style={{ position: 'absolute', top: '10px', left: '10px', background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}><FaTimes /></button>
                    <h4 className="text-cursive" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Pro Tip 👋</h4>
                    <p style={{ fontSize: '0.9rem', color: '#aaa', lineHeight: '1.4' }}>
                        Get our Edge extension to watch solutions directly on LeetCode!
                    </p>
                    <div style={{ marginTop: '1rem', width: '0', height: '0', borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderBottom: '15px solid var(--accent-orange)', position: 'absolute', top: '-15px', right: '40px' }}></div>
                </div>
            )}

            {/* Hero Section */}
            <section style={{
                position: 'relative',
                padding: '1rem 2rem 6rem',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '1200px', width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4rem' }}>

                    {/* Hero Text Content - Centered */}
                    <div style={{ flex: '1', minWidth: '300px', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                        <h1 className="text-editorial hero-main-title" style={{
                            fontSize: 'clamp(3rem, 12vw, 7.5rem)',
                            marginBottom: '3rem',
                            fontWeight: '800',
                            color: 'white',
                            lineHeight: '0.85'
                        }}>
                            GET ACCESS TO <br />
                            <span className="shimmer" style={{ color: 'var(--accent-orange)', display: 'inline-block' }}>HUNDREDS</span> <br />
                            <span className="text-cursive" style={{ fontSize: '0.8em', color: 'white' }}>of Coding Solutions</span> <br />
                            AVAILABLE
                        </h1>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div className="glass-pill hero-cta-btn"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '15px',
                                        padding: '15px 30px',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => navigate('/companies')}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        {[
                                            { logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg", name: 'Google' },
                                            { logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", name: 'Microsoft' },
                                            { logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg", name: 'Meta' }
                                        ].map((company, i) => (
                                            <div key={company.name} style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '50%',
                                                background: company.name === 'Microsoft' ? 'transparent' : 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                marginLeft: i > 0 ? '-12px' : '0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden',
                                                zIndex: 3 - i,
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                                            }}>
                                                <img
                                                    src={company.logo}
                                                    alt={company.name}
                                                    style={{
                                                        width: company.name === 'Microsoft' ? '80%' : '70%',
                                                        height: company.name === 'Microsoft' ? '80%' : '70%',
                                                        objectFit: 'contain'
                                                    }}
                                                />
                                            </div>
                                        ))}
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: '#222',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            marginLeft: '-12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.9rem',
                                            color: '#888',
                                            fontWeight: '700',
                                            zIndex: 0
                                        }}>
                                            +
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            background: 'var(--accent-orange)',
                                            color: 'white',
                                            border: 'none',
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 15px 30px rgba(245, 124, 0, 0.4)',
                                            transition: 'transform 0.3s ease'
                                        }}
                                    >
                                        <FaArrowRight size={18} />
                                    </div>
                                </div>
                                <button
                                    className="hero-cta-btn secondary"
                                    onClick={() => window.location.href = '/explore'}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        padding: '15px 35px',
                                        borderRadius: '30px',
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                >
                                    Explore Solutions
                                </button>
                            </div>

                            <p style={{
                                fontSize: '1.25rem',
                                color: '#666',
                                maxWidth: '380px',
                                lineHeight: '1.5',
                                marginTop: '1rem'
                            }}>
                                Master your interview technical rounds with clear-sighted video guides.
                                Focused. Visual. Effective.
                            </p>
                        </div>
                    </div>







                </div>
            </section>

            {/* Trust Marquee */}
            <section style={{ padding: '6rem 0', zIndex: 1, position: 'relative', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{ color: 'var(--accent-orange)', fontSize: '0.9rem', fontWeight: '800', letterSpacing: '4px', textTransform: 'uppercase', opacity: 0.8 }}>
                        The company questions we provide
                    </div>
                </div>
                <div className="marquee-container">
                    <div className="marquee-content">
                        {['GOOGLE', 'AMAZON', 'META', 'MICROSOFT', 'NETFLIX', 'UBER', 'AIRBNB', 'ADOBE', 'APPLE', 'NVIDIA'].map(company => (
                            <div key={company} style={{ fontSize: '2.2rem', fontWeight: '800', color: '#888', letterSpacing: '4px', opacity: 0.8 }}>
                                {company}
                            </div>
                        ))}
                        {['GOOGLE', 'AMAZON', 'META', 'MICROSOFT', 'NETFLIX', 'UBER', 'AIRBNB', 'ADOBE', 'APPLE', 'NVIDIA'].map(company => (
                            <div key={company + '_2'} style={{ fontSize: '2.2rem', fontWeight: '800', color: '#888', letterSpacing: '4px', opacity: 0.8 }}>
                                {company}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Sections - Realistic Features */}
            <section style={{ padding: '6rem 2rem', maxWidth: '1100px', margin: '0 auto', zIndex: 1, position: 'relative' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>

                    {/* Curated Solutions Card */}
                    <div className="glass-card-3d" style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                        <div className="text-cursive" style={{ fontSize: '2rem', opacity: 0.5 }}>01.</div>
                        <h2 className="text-editorial" style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: '0.9' }}>CURATED <br />SOLUTIONS</h2>
                        <p style={{ color: '#888', fontSize: '1rem', lineHeight: '1.6' }}>
                            Hand-picked video solutions for the most frequent interview questions. We focus on clarity and understanding.
                        </p>
                    </div>

                    {/* Company Prep Card */}
                    <div className="glass-card-3d" style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                        <div className="text-cursive" style={{ fontSize: '2rem', opacity: 0.5 }}>02.</div>
                        <h2 className="text-editorial" style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: '0.9' }}>COMPANY <br />FOCUS</h2>
                        <p style={{ color: '#888', fontSize: '1rem', lineHeight: '1.6' }}>
                            Direct insights into the questions asked at top-tier companies. Prepare exactly for where you want to go.
                        </p>
                    </div>

                    {/* Master Patterns Card */}
                    <div className="glass-card-3d" style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                        <div className="text-cursive" style={{ fontSize: '2rem', opacity: 0.5 }}>03.</div>
                        <h2 className="text-editorial" style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: '0.9' }}>MASTER <br />PATTERNS</h2>
                        <p style={{ color: '#888', fontSize: '1rem', lineHeight: '1.6' }}>
                            Solve one, master a hundred. Our guides help you recognize and apply patterns across any coding problem.
                        </p>
                    </div>

                </div>
            </section>

            {/* Platform Support Section - Animated Marquee */}
            <section className="platform-marquee-section" style={{ zIndex: 1, position: 'relative', overflow: 'hidden' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h3 className="text-editorial" style={{ fontSize: '2.2rem', opacity: 0.9, letterSpacing: '2px', fontWeight: '800' }}>
                        COMPATIBLE WITH EVERY MAJOR PLATFORM
                    </h3>
                </div>

                <div className="marquee-container">
                    <div className="platform-marquee-content">
                        {platforms.map(p => (
                            <div key={p.name} className="platform-badge">
                                {p.icon} <span>{p.name}</span>
                            </div>
                        ))}
                        {/* Duplicate for seamless loop */}
                        {platforms.map(p => (
                            <div key={p.name + '_loop'} className="platform-badge">
                                {p.icon} <span>{p.name}</span>
                            </div>
                        ))}
                        {/* More duplicates to fill space */}
                        {platforms.map(p => (
                            <div key={p.name + '_loop2'} className="platform-badge">
                                {p.icon} <span>{p.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '3rem', opacity: 0.6, fontSize: '1.1rem', fontWeight: '600', color: 'white' }}>
                    + Video solutions for 1000+ problems
                </div>
            </section>

            {/* Call to Action - About & Mission */}
            <section style={{ padding: '0 2rem 8rem', zIndex: 1, position: 'relative' }}>
                <div className="perspective-1000">
                    <div style={{
                        maxWidth: '1000px',
                        margin: '0 auto',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '5rem 3rem',
                        textAlign: 'center',
                        background: '#111',
                        border: '1px solid #333',
                        borderRadius: '32px',
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Subtle Orange Glow */}
                        <div style={{
                            position: 'absolute',
                            top: '0',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '100%',
                            height: '100%',
                            background: 'radial-gradient(ellipse at top, rgba(245, 124, 0, 0.15), transparent 60%)',
                            pointerEvents: 'none',
                        }}></div>

                        <div className="text-cursive" style={{
                            fontSize: '1.8rem',
                            marginBottom: '1.5rem',
                            color: 'var(--accent-orange)',
                            position: 'relative',
                            zIndex: 2
                        }}>
                            Stop reading. Start visualizing.
                        </div>

                        <h2 className="text-editorial" style={{
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            fontWeight: '800',
                            marginBottom: '1.5rem',
                            color: 'white',
                            position: 'relative',
                            zIndex: 2,
                            lineHeight: '1.2'
                        }}>
                            THE ULTIMATE <br/> INTERVIEW COMPANION
                        </h2>

                        <p style={{
                            color: '#aaa',
                            fontSize: '1.1rem',
                            lineHeight: '1.6',
                            maxWidth: '700px',
                            margin: '0 auto 3rem auto',
                            position: 'relative',
                            zIndex: 2
                        }}>
                            LeetVision bridges the gap between struggling with complex code and truly understanding algorithms. We aggregate the most frequently asked questions from top companies and provide <strong>clear, step-by-step video solutions</strong>. Whether it's LeetCode, CodeChef, or HackerRank, we help you recognize the patterns needed to crack your dream job.
                        </p>

                        <Link to="/explore" style={{
                            background: 'var(--accent-orange)',
                            color: 'white',
                            padding: '1rem 3rem',
                            borderRadius: '50px',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            textDecoration: 'none',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 10px 20px rgba(245, 124, 0, 0.3)',
                            position: 'relative',
                            zIndex: 2
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 15px 25px rgba(245, 124, 0, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 10px 20px rgba(245, 124, 0, 0.3)';
                        }}>
                            Start Learning Free
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default LandingPage;
