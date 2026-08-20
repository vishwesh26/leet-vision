import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import SEO from './SEO';
import {
    FaArrowRight,
    FaArrowLeft,
    FaCheckCircle,
    FaLock,
    FaChevronDown,
    FaChevronUp,
    FaCode,
    FaUsers,
    FaBuilding,
    FaGlobe
} from 'react-icons/fa';
import '../homepage.css';

/**
 * SponsorPage — High-end Editorial Obsidian Amber Sponsorship Portal
 * Designed with Stitch to match LeetVision's exact landing page aesthetic.
 */
const SponsorPage = () => {
    const location = useLocation();
    const formRef = useRef(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        companyName: '',
        websiteUrl: '',
        placement: 'Homepage',
        budget: '$500 - $1,000 / mo',
        message: ''
    });

    const [status, setStatus] = useState('idle'); // idle | submitting | success | error
    const [errorMessage, setErrorMessage] = useState('');

    // Pre-populate placement if navigated from a specific slot
    useEffect(() => {
        if (location.state?.defaultPlacement) {
            const dp = location.state.defaultPlacement;
            let matched = 'Homepage';
            if (dp.toLowerCase().includes('solution')) matched = 'Solution';
            else if (dp.toLowerCase().includes('roadmap') || dp.toLowerCase().includes('topic')) matched = 'Roadmap';
            setFormData(prev => ({ ...prev, placement: matched }));
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const scrollToForm = () => {
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');
        setErrorMessage('');

        try {
            const API_BASE = import.meta.env.VITE_API_URL || '';
            await axios.post(`${API_BASE}/api/sponsor/inquiry`, formData);
            setStatus('success');
        } catch (err) {
            console.error('Sponsorship inquiry submission failed:', err);
            setErrorMessage(err.response?.data?.error || 'Failed to submit inquiry. Please try again.');
            setStatus('error');
        }
    };

    // FAQ items data
    const faqs = [
        {
            q: "Who is the LeetVision audience?",
            a: "Our audience consists of over 10,000+ active software engineers, computer science students, and tech interview candidates preparing for roles at FAANG, top tech companies, and high-growth startups."
        },
        {
            q: "What sponsorship placements are available?",
            a: "We offer high-visibility Homepage Hero Banners, contextual Solution & 3D WebGL Visualizer Page Cards, and targeted Topic/Company Roadmap Partnerships. Custom newsletter collaborations are also available."
        },
        {
            q: "How fast can our campaign go live?",
            a: "Once approved, our team provides onboarding and assets integration within 24 to 48 hours. We provide live click-through telemetry and impression tracking."
        },
        {
            q: "What types of companies sponsor LeetVision?",
            a: "Developer tooling companies, AI coding assistants, SaaS platforms, technical recruitment programs, coding bootcamps, and API infrastructure providers looking for hyper-targeted developer reach."
        }
    ];

    const [openFaq, setOpenFaq] = useState(null);

    return (
        <div className="hp-page" style={{ minHeight: '100vh', paddingBottom: '120px' }}>
            <SEO
                title="Sponsor LeetVision • Partner With Us"
                description="Put your brand in front of 10,000 software engineers and top tech candidates on LeetVision."
                path="/sponsor"
            />

            {/* Top Atmospheric Radial Glow */}
            <div style={{
                position: 'absolute',
                top: '5%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '750px',
                height: '750px',
                background: 'radial-gradient(circle, rgba(245, 124, 0, 0.12) 0%, rgba(10, 10, 10, 0) 70%)',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 2 }}>
                {/* Back Link */}
                <Link
                    to="/"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--hp-fg-muted)',
                        textDecoration: 'none',
                        fontSize: '0.85rem',
                        fontFamily: 'var(--hp-font-mono)',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        marginBottom: '40px',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--hp-accent)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--hp-fg-muted)')}
                >
                    <FaArrowLeft size={12} /> Back to LeetVision
                </Link>

                {/* ── 1. HERO SECTION ────────────────────────────────────────── */}
                <div style={{ textAlign: 'center', maxWidth: '880px', margin: '0 auto 60px auto' }}>
                    <div className="hp-eyebrow" style={{ color: 'var(--hp-accent)', marginBottom: '16px' }}>
                        OFFICIAL SPONSORSHIPS
                    </div>

                    <h1 className="hp-heading hp-heading-xl" style={{ margin: '0 0 24px 0', lineHeight: 1.05 }}>
                        Reach the next generation <br />
                        <span style={{ color: 'var(--hp-accent)' }}>of senior engineers.</span>
                    </h1>

                    <p className="hp-body" style={{ margin: '0 auto 36px auto', fontSize: '1.15rem', maxWidth: '640px' }}>
                        Connect your brand, developer tool, API, or hiring pipeline with 10,000+ top-tier software engineers actively practicing algorithms and preparing for career milestones.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                        <button
                            onClick={scrollToForm}
                            className="hp-btn-primary"
                            style={{ padding: '14px 32px', fontSize: '1rem', cursor: 'pointer' }}
                        >
                            Partner With Us <FaArrowRight size={14} />
                        </button>
                        <a
                            href="#placements"
                            className="hp-btn-ghost"
                            style={{ padding: '14px 28px', fontSize: '0.95rem', textDecoration: 'none' }}
                        >
                            Explore Placements
                        </a>
                    </div>
                </div>

                {/* ── 2. STATS MARQUEE ─────────────────────────────────────────── */}
                <div style={{
                    borderTop: '1px solid var(--hp-border)',
                    borderBottom: '1px solid var(--hp-border)',
                    padding: '20px 0',
                    margin: '0 0 80px 0',
                    background: 'rgba(20, 20, 20, 0.4)',
                    backdropFilter: 'blur(8px)'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '24px',
                        fontFamily: 'var(--hp-font-mono)',
                        fontSize: '0.85rem',
                        color: 'var(--hp-fg-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#fff', fontWeight: 700 }}>10,000+</span> Monthly Devs
                        </div>
                        <span style={{ opacity: 0.2 }}>•</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#fff', fontWeight: 700 }}>3,500+</span> LeetCode Solutions
                        </div>
                        <span style={{ opacity: 0.2 }}>•</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: 'var(--hp-accent)', fontWeight: 700 }}>4.2 MIN</span> Avg Session
                        </div>
                        <span style={{ opacity: 0.2 }}>•</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#fff', fontWeight: 700 }}>340+</span> Companies Tagged
                        </div>
                    </div>
                </div>

                {/* ── 3. PLACEMENT SHOWCASE (BROWSER MOCKUP) ─────────────────── */}
                <div id="placements" style={{ marginBottom: '90px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                        <span className="hp-mono" style={{ color: 'var(--hp-fg-muted)', fontSize: '0.8rem' }}>01 / VISUAL PLACEMENT PREVIEW</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--hp-border)' }} />
                    </div>

                    <div className="hp-browser" style={{ boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)' }}>
                        <div className="hp-browser-bar">
                            <div className="hp-browser-dots">
                                <div className="hp-browser-dot hp-browser-dot--red" />
                                <div className="hp-browser-dot hp-browser-dot--yellow" />
                                <div className="hp-browser-dot hp-browser-dot--green" />
                            </div>
                            <div className="hp-browser-url">leet-vision.com/solution/704</div>
                        </div>

                        <div className="hp-browser-body" style={{ padding: '48px 32px', background: '#0e1015' }}>
                            {/* Visual Spotlight Mockup */}
                            <div style={{
                                background: 'linear-gradient(135deg, rgba(20, 24, 36, 0.95) 0%, rgba(13, 16, 24, 0.98) 100%)',
                                border: '1px solid rgba(245, 124, 0, 0.35)',
                                borderRadius: '12px',
                                padding: '28px 32px',
                                maxWidth: '780px',
                                margin: '0 auto',
                                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4), 0 0 30px rgba(245, 124, 0, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '24px',
                                flexWrap: 'wrap'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '10px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '8px',
                                        boxSizing: 'border-box'
                                    }}>
                                        <img src="/spaceship-thumb.png" alt="Spaceship" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                            <span style={{
                                                color: 'var(--hp-accent)',
                                                fontSize: '0.72rem',
                                                fontFamily: 'var(--hp-font-mono)',
                                                fontWeight: 700,
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                letterSpacing: '0.08em',
                                                textTransform: 'uppercase'
                                            }}>
                                                <img src="/spaceship-thumb.png" alt="Spaceship" style={{ width: '16px', height: '16px', objectFit: 'contain' }} /> SPONSOR SPOTLIGHT
                                            </span>
                                            <span style={{ color: 'rgba(255, 255, 255, 0.2)', fontSize: '0.7rem' }}>•</span>
                                            <span style={{ color: 'var(--hp-fg-muted)', fontSize: '0.72rem', fontFamily: 'var(--hp-font-mono)' }}>
                                                10,000 REACH
                                            </span>
                                        </div>
                                        <h3 className="hp-serif" style={{ fontSize: '1.4rem', color: '#fff', margin: '0 0 4px 0' }}>
                                            Your Company / Product Here
                                        </h3>
                                        <p style={{ color: 'var(--hp-fg-muted)', fontSize: '0.85rem', margin: 0 }}>
                                            Featured brand introduction & direct link to your developer tools.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={scrollToForm}
                                    className="hp-btn-primary"
                                    style={{ padding: '10px 20px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                                >
                                    Claim Slot <FaArrowRight size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── 4. SPONSORSHIP TIERS (3-COLUMN GRID) ──────────────────── */}
                <div style={{ marginBottom: '90px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                        <span className="hp-mono" style={{ color: 'var(--hp-fg-muted)', fontSize: '0.8rem' }}>02 / AVAILABLE SPONSORSHIP TIERS</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--hp-border)' }} />
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: '24px'
                    }}>
                        {/* Tier 1 */}
                        <div style={{
                            background: 'var(--hp-bg-raised)',
                            border: '1px solid rgba(245, 124, 0, 0.3)',
                            borderRadius: '8px',
                            padding: '32px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div>
                                <div style={{
                                    display: 'inline-block',
                                    background: 'rgba(245, 124, 0, 0.12)',
                                    color: 'var(--hp-accent)',
                                    padding: '4px 10px',
                                    borderRadius: '4px',
                                    fontFamily: 'var(--hp-font-mono)',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    marginBottom: '16px'
                                }}>
                                    Tier 1 • Flagship
                                </div>
                                <h3 className="hp-serif" style={{ fontSize: '1.65rem', color: '#fff', margin: '0 0 12px 0' }}>
                                    Homepage Hero Spotlight
                                </h3>
                                <p style={{ color: 'var(--hp-fg-muted)', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                                    Prime visibility directly on the LeetVision homepage. Reaches all landing visitors, returning developers, and daily problem solvers upon first entry.
                                </p>
                            </div>
                            <div style={{ borderTop: '1px solid var(--hp-border)', paddingTop: '16px' }}>
                                <div style={{ color: 'var(--hp-accent)', fontFamily: 'var(--hp-font-mono)', fontWeight: 700, fontSize: '0.95rem' }}>
                                    10,000+ monthly impressions
                                </div>
                            </div>
                        </div>

                        {/* Tier 2 */}
                        <div style={{
                            background: 'var(--hp-bg-raised)',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            borderRadius: '8px',
                            padding: '32px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <div style={{
                                    display: 'inline-block',
                                    background: 'rgba(56, 189, 248, 0.12)',
                                    color: '#38bdf8',
                                    padding: '4px 10px',
                                    borderRadius: '4px',
                                    fontFamily: 'var(--hp-font-mono)',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    marginBottom: '16px'
                                }}>
                                    Tier 2 • High Intent
                                </div>
                                <h3 className="hp-serif" style={{ fontSize: '1.65rem', color: '#fff', margin: '0 0 12px 0' }}>
                                    Solution & 3D Visualizer Cards
                                </h3>
                                <p style={{ color: 'var(--hp-fg-muted)', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                                    Targeted placement integrated into 3,500+ LeetCode solution pages and sidebars beside our interactive 3D WebGL visualizers.
                                </p>
                            </div>
                            <div style={{ borderTop: '1px solid var(--hp-border)', paddingTop: '16px' }}>
                                <div style={{ color: '#38bdf8', fontFamily: 'var(--hp-font-mono)', fontWeight: 700, fontSize: '0.95rem' }}>
                                    3,500+ problem pages
                                </div>
                            </div>
                        </div>

                        {/* Tier 3 */}
                        <div style={{
                            background: 'var(--hp-bg-raised)',
                            border: '1px solid rgba(28, 195, 61, 0.25)',
                            borderRadius: '8px',
                            padding: '32px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <div style={{
                                    display: 'inline-block',
                                    background: 'rgba(28, 195, 61, 0.12)',
                                    color: 'var(--hp-accent-green)',
                                    padding: '4px 10px',
                                    borderRadius: '4px',
                                    fontFamily: 'var(--hp-font-mono)',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    marginBottom: '16px'
                                }}>
                                    Tier 3 • Targeted
                                </div>
                                <h3 className="hp-serif" style={{ fontSize: '1.65rem', color: '#fff', margin: '0 0 12px 0' }}>
                                    Roadmap & Topic Partnerships
                                </h3>
                                <p style={{ color: 'var(--hp-fg-muted)', fontSize: '0.9rem', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                                    Target specific engineer subsets (e.g. Dynamic Programming, Graphs, FAANG company-wise preparation roadmaps) with dedicated partner banners.
                                </p>
                            </div>
                            <div style={{ borderTop: '1px solid var(--hp-border)', paddingTop: '16px' }}>
                                <div style={{ color: 'var(--hp-accent-green)', fontFamily: 'var(--hp-font-mono)', fontWeight: 700, fontSize: '0.95rem' }}>
                                    Targeted algorithm domains
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── 5. INQUIRY FORM ────────────────────────────────────────── */}
                <div ref={formRef} style={{ marginBottom: '90px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                        <span className="hp-mono" style={{ color: 'var(--hp-fg-muted)', fontSize: '0.8rem' }}>03 / PARTNER INQUIRY</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--hp-border)' }} />
                    </div>

                    <div style={{
                        background: 'var(--hp-bg-raised)',
                        border: '1px solid var(--hp-border)',
                        borderRadius: '12px',
                        padding: '48px',
                        maxWidth: '800px',
                        margin: '0 auto',
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
                    }}>
                        {status === 'success' ? (
                            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    background: 'rgba(28, 195, 61, 0.15)',
                                    color: 'var(--hp-accent-green)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 20px auto',
                                    fontSize: '1.8rem'
                                }}>
                                    <FaCheckCircle />
                                </div>
                                <h2 className="hp-serif" style={{ fontSize: '2rem', color: '#fff', marginBottom: '12px' }}>
                                    Inquiry Received.
                                </h2>
                                <p style={{ color: 'var(--hp-fg-muted)', fontSize: '0.95rem', lineHeight: '1.6', maxWidth: '500px', margin: '0 auto 28px auto' }}>
                                    Thank you for your interest in partnering with LeetVision. We have logged your request for <strong>{formData.companyName}</strong> and will get back to <strong>{formData.email}</strong> within 24 hours.
                                </p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="hp-btn-ghost"
                                    style={{ padding: '10px 24px', cursor: 'pointer' }}
                                >
                                    Submit Another Inquiry
                                </button>
                            </div>
                        ) : (
                            <div>
                                <h2 className="hp-serif" style={{ fontSize: '2.2rem', color: '#fff', margin: '0 0 8px 0', textAlign: 'center' }}>
                                    Partner with us
                                </h2>
                                <p style={{ color: 'var(--hp-fg-muted)', fontSize: '0.92rem', textAlign: 'center', margin: '0 0 36px 0' }}>
                                    Fill out the form below to receive our full media kit, availability calendar, and custom partner pricing.
                                </p>

                                {status === 'error' && (
                                    <div style={{
                                        background: 'rgba(223, 11, 11, 0.12)',
                                        border: '1px solid rgba(223, 11, 11, 0.3)',
                                        color: '#ff6b6b',
                                        padding: '12px 16px',
                                        borderRadius: '6px',
                                        marginBottom: '24px',
                                        fontSize: '0.85rem',
                                        fontFamily: 'var(--hp-font-mono)'
                                    }}>
                                        {errorMessage}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--hp-font-mono)', color: 'var(--hp-fg-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                                                Contact Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                placeholder="Alex Rivera"
                                                style={{
                                                    width: '100%',
                                                    background: 'var(--hp-bg)',
                                                    border: '1px solid var(--hp-border)',
                                                    borderRadius: '4px',
                                                    padding: '12px 14px',
                                                    color: '#fff',
                                                    fontSize: '0.95rem',
                                                    outline: 'none',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--hp-font-mono)', color: 'var(--hp-fg-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                                                Work Email *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="alex@company.com"
                                                style={{
                                                    width: '100%',
                                                    background: 'var(--hp-bg)',
                                                    border: '1px solid var(--hp-border)',
                                                    borderRadius: '4px',
                                                    padding: '12px 14px',
                                                    color: '#fff',
                                                    fontSize: '0.95rem',
                                                    outline: 'none',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--hp-font-mono)', color: 'var(--hp-fg-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                                                Company / Brand Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="companyName"
                                                value={formData.companyName}
                                                onChange={handleChange}
                                                required
                                                placeholder="e.g. DevFlow AI"
                                                style={{
                                                    width: '100%',
                                                    background: 'var(--hp-bg)',
                                                    border: '1px solid var(--hp-border)',
                                                    borderRadius: '4px',
                                                    padding: '12px 14px',
                                                    color: '#fff',
                                                    fontSize: '0.95rem',
                                                    outline: 'none',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--hp-font-mono)', color: 'var(--hp-fg-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                                                Website / Product URL
                                            </label>
                                            <input
                                                type="url"
                                                name="websiteUrl"
                                                value={formData.websiteUrl}
                                                onChange={handleChange}
                                                placeholder="https://yourcompany.com"
                                                style={{
                                                    width: '100%',
                                                    background: 'var(--hp-bg)',
                                                    border: '1px solid var(--hp-border)',
                                                    borderRadius: '4px',
                                                    padding: '12px 14px',
                                                    color: '#fff',
                                                    fontSize: '0.95rem',
                                                    outline: 'none',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Desired Placement Pills */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--hp-font-mono)', color: 'var(--hp-fg-muted)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>
                                            Desired Placement
                                        </label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                            {['Homepage', 'Solution', 'Roadmap', 'Custom'].map((p) => {
                                                const isSelected = formData.placement === p;
                                                return (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, placement: p }))}
                                                        style={{
                                                            background: isSelected ? 'rgba(245, 124, 0, 0.15)' : 'transparent',
                                                            border: isSelected ? '1px solid var(--hp-accent)' : '1px solid var(--hp-border)',
                                                            color: isSelected ? 'var(--hp-accent)' : 'var(--hp-fg-muted)',
                                                            padding: '8px 16px',
                                                            borderRadius: '4px',
                                                            fontFamily: 'var(--hp-font-mono)',
                                                            fontSize: '0.78rem',
                                                            fontWeight: 600,
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {p === 'Homepage' && 'Homepage Hero'}
                                                        {p === 'Solution' && 'Solution Page'}
                                                        {p === 'Roadmap' && 'Roadmap & Topics'}
                                                        {p === 'Custom' && 'Custom / Newsletter'}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Budget Dropdown */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--hp-font-mono)', color: 'var(--hp-fg-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                                            Estimated Monthly Budget
                                        </label>
                                        <select
                                            name="budget"
                                            value={formData.budget}
                                            onChange={handleChange}
                                            style={{
                                                width: '100%',
                                                background: 'var(--hp-bg)',
                                                border: '1px solid var(--hp-border)',
                                                borderRadius: '4px',
                                                padding: '12px 14px',
                                                color: '#fff',
                                                fontSize: '0.95rem',
                                                outline: 'none',
                                                boxSizing: 'border-box'
                                            }}
                                        >
                                            <option value="$250 - $500 / mo">$250 - $500 / month</option>
                                            <option value="$500 - $1,000 / mo">$500 - $1,000 / month</option>
                                            <option value="$1,000 - $2,500 / mo">$1,000 - $2,500 / month</option>
                                            <option value="$2,500+ / mo">$2,500+ / month</option>
                                            <option value="Custom Partnership">Custom Partnership</option>
                                        </select>
                                    </div>

                                    {/* Goals / Message Textarea */}
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--hp-font-mono)', color: 'var(--hp-fg-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                                            Campaign Goals & Message *
                                        </label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={4}
                                            placeholder="Describe what you want to promote (developer tool, product launch, hiring campaign, course) and any target start dates..."
                                            style={{
                                                width: '100%',
                                                background: 'var(--hp-bg)',
                                                border: '1px solid var(--hp-border)',
                                                borderRadius: '4px',
                                                padding: '12px 14px',
                                                color: '#fff',
                                                fontSize: '0.95rem',
                                                outline: 'none',
                                                resize: 'vertical',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={status === 'submitting'}
                                        className="hp-btn-primary"
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            fontSize: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px',
                                            cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                                            opacity: status === 'submitting' ? 0.7 : 1
                                        }}
                                    >
                                        {status === 'submitting' ? 'Submitting Inquiry...' : 'Send Inquiry'} <FaArrowRight size={14} />
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── 6. FAQ SECTION ─────────────────────────────────────────── */}
                <div style={{ maxWidth: '800px', margin: '0 auto 60px auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                        <span className="hp-mono" style={{ color: 'var(--hp-fg-muted)', fontSize: '0.8rem' }}>04 / FREQUENTLY ASKED QUESTIONS</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--hp-border)' }} />
                    </div>

                    <div className="hp-faq-list">
                        {faqs.map((faq, idx) => {
                            const isOpen = openFaq === idx;
                            return (
                                <div key={idx} className="hp-faq-item" style={{ borderBottom: '1px solid var(--hp-border)' }}>
                                    <button
                                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            background: 'none',
                                            border: 'none',
                                            padding: '20px 0',
                                            color: '#fff',
                                            textAlign: 'left',
                                            fontSize: '1.1rem',
                                            fontFamily: 'var(--hp-font-body)',
                                            fontWeight: 500,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <span>{faq.q}</span>
                                        <span style={{ color: 'var(--hp-fg-muted)' }}>
                                            {isOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                                        </span>
                                    </button>

                                    {isOpen && (
                                        <div style={{ paddingBottom: '20px', color: 'var(--hp-fg-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SponsorPage;
