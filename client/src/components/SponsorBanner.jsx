import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaUsers } from 'react-icons/fa';
import '../homepage.css';

/**
 * SponsorBanner — High-converting Editorial Obsidian Amber promotional sponsor slot
 * Styled to seamlessly blend with LeetVision's editorial dark aesthetic.
 *
 * Variants:
 *  - 'hero'    : Prominent banner for Homepage
 *  - 'card'    : Card-style slot for Solution Pages & Problem List sidebars
 *  - 'strip'   : Horizontal bar for Roadmaps, Problem Lists, and Solution Pages
 */
const SponsorBanner = ({
    variant = 'strip',
    title,
    subtitle,
    slotName = 'Sponsored Developer Spotlight',
    buttonText = 'Claim Sponsor Slot',
    linkTo = '/sponsor',
    style = {}
}) => {
    // ── 1. HERO VARIANT (Homepage Showcase) ───────────────────────────
    if (variant === 'hero') {
        return (
            <div
                style={{
                    position: 'relative',
                    background: 'linear-gradient(180deg, #141414 0%, #0a0a0a 100%)',
                    border: '1px solid var(--hp-border)',
                    borderRadius: '8px',
                    padding: '48px 36px',
                    margin: '40px 0',
                    overflow: 'hidden',
                    ...style
                }}
            >
                {/* Radial Amber Light leak in background */}
                <div style={{
                    position: 'absolute',
                    top: '-60px',
                    right: '-60px',
                    width: '320px',
                    height: '320px',
                    background: 'radial-gradient(circle, rgba(245, 124, 0, 0.15) 0%, rgba(10, 10, 10, 0) 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />

                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'var(--hp-accent)',
                            fontFamily: 'var(--hp-font-mono)',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase'
                        }}>
                            <img src="/spaceship-thumb.png" alt="Spaceship" style={{ width: '22px', height: '22px', objectFit: 'contain' }} /> SPONSOR SPOTLIGHT
                        </div>

                        <div style={{
                            fontFamily: 'var(--hp-font-mono)',
                            fontSize: '0.78rem',
                            color: 'var(--hp-fg-muted)',
                            letterSpacing: '0.05em'
                        }}>
                            10,000+ MONTHLY DEVELOPERS
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'center' }}>
                        <div>
                            <h3 className="hp-heading" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', margin: '0 0 12px 0', lineHeight: 1.15 }}>
                                {title || 'Sponsor Slot Available'}
                            </h3>
                            <p style={{ color: 'var(--hp-fg-muted)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0, maxWidth: '540px' }}>
                                {subtitle || 'Promote your product, dev tool, or hiring role directly on LeetVision.'}
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-start', md: { justifyContent: 'flex-end' }, alignItems: 'center' }}>
                            <Link
                                to={linkTo}
                                state={{ defaultPlacement: slotName }}
                                className="hp-btn-primary"
                                style={{
                                    padding: '14px 28px',
                                    fontSize: '0.95rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    textDecoration: 'none'
                                }}
                            >
                                {buttonText} <FaArrowRight size={13} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── 2. VERTICAL VARIANT (Companies Grid & Vertical Sidebars) ─────
    if (variant === 'vertical') {
        return (
            <div
                style={{
                    position: 'relative',
                    background: 'linear-gradient(180deg, rgba(20, 20, 20, 0.95) 0%, rgba(10, 10, 10, 0.98) 100%)',
                    border: '1px solid rgba(245, 124, 0, 0.4)',
                    borderRadius: '16px',
                    padding: '28px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '240px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), 0 0 25px rgba(245, 124, 0, 0.12)',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    ...style
                }}
            >
                {/* Radial Glow */}
                <div style={{
                    position: 'absolute',
                    top: '-40px',
                    right: '-40px',
                    width: '180px',
                    height: '180px',
                    background: 'radial-gradient(circle, rgba(245, 124, 0, 0.2) 0%, rgba(10, 10, 10, 0) 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                }} />

                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: 'var(--hp-accent)',
                            fontFamily: 'var(--hp-font-mono)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase'
                        }}>
                            <img src="/spaceship-thumb.png" alt="Spaceship" style={{ width: '22px', height: '22px', objectFit: 'contain' }} /> SPONSOR SPOTLIGHT
                        </div>
                        <span style={{ color: 'var(--hp-fg-muted)', fontSize: '0.72rem', fontFamily: 'var(--hp-font-mono)' }}>
                            10,000+ REACH
                        </span>
                    </div>

                    <h3 className="hp-serif" style={{ fontSize: '1.55rem', color: '#fff', margin: '0 0 8px 0', lineHeight: 1.15 }}>
                        {title || 'Sponsor Slot Available'}
                    </h3>

                    <p style={{ color: 'var(--hp-fg-muted)', fontSize: '0.86rem', lineHeight: '1.5', margin: '0 0 18px 0' }}>
                        {subtitle || 'Promote your product, dev tool, or hiring role to 10,000+ software engineers.'}
                    </p>
                </div>

                <div>
                    <Link
                        to={linkTo}
                        state={{ defaultPlacement: slotName }}
                        className="hp-btn-primary"
                        style={{
                            width: '100%',
                            padding: '10px 18px',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            textDecoration: 'none',
                            boxSizing: 'border-box'
                        }}
                    >
                        {buttonText} <FaArrowRight size={12} />
                    </Link>
                </div>
            </div>
        );
    }

    // ── 3. CARD VARIANT (Sidebar & Detail views) ──────────────────────
    if (variant === 'card') {
        return (
            <div
                style={{
                    background: 'var(--hp-bg-raised)',
                    border: '1px solid var(--hp-border)',
                    borderRadius: '8px',
                    padding: '28px',
                    margin: '20px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    ...style
                }}
            >
                <div>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--hp-accent)',
                        fontFamily: 'var(--hp-font-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        marginBottom: '14px'
                    }}>
                        <img src="/spaceship-thumb.png" alt="Spaceship" style={{ width: '20px', height: '20px', objectFit: 'contain' }} /> SPONSOR SPOTLIGHT
                    </div>

                    <h4 className="hp-serif" style={{ fontSize: '1.4rem', color: '#fff', margin: '0 0 10px 0', lineHeight: 1.2 }}>
                        {title || 'Sponsor Slot Available'}
                    </h4>

                    <p style={{ color: 'var(--hp-fg-muted)', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 20px 0' }}>
                        {subtitle || 'Promote your product to active developers.'}
                    </p>
                </div>

                <Link
                    to={linkTo}
                    state={{ defaultPlacement: slotName }}
                    className="hp-btn-primary"
                    style={{
                        padding: '10px 18px',
                        fontSize: '0.82rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        textDecoration: 'none'
                    }}
                >
                    {buttonText} <FaArrowRight size={11} />
                </Link>
            </div>
        );
    }

    // ── 3. STRIP VARIANT (Roadmap, Problem Lists, Solutions) ──────────
    return (
        <div
            style={{
                background: 'linear-gradient(90deg, #141414 0%, #0e0e0e 100%)',
                border: '1px solid var(--hp-border)',
                borderRadius: '6px',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
                flexWrap: 'wrap',
                position: 'relative',
                overflow: 'hidden',
                ...style
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 320px' }}>
                <div style={{
                    width: '38px',
                    height: '38px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <img src="/spaceship-thumb.png" alt="Spaceship" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                </div>

                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{
                            color: 'var(--hp-accent)',
                            fontFamily: 'var(--hp-font-mono)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <img src="/spaceship-thumb.png" alt="Spaceship" style={{ width: '16px', height: '16px', objectFit: 'contain' }} /> SPONSOR SPOTLIGHT
                        </span>
                        <span style={{ color: 'rgba(255, 255, 255, 0.2)', fontSize: '0.7rem' }}>•</span>
                        <span style={{ color: 'var(--hp-fg-muted)', fontFamily: 'var(--hp-font-mono)', fontSize: '0.7rem' }}>
                            10,000+ ENGINEERS
                        </span>
                    </div>

                    <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
                        {title || 'Sponsor Slot Available — Reach 10,000+ Software Engineers'}
                    </div>
                </div>
            </div>

            <Link
                to={linkTo}
                state={{ defaultPlacement: slotName }}
                className="hp-btn-primary"
                style={{
                    padding: '8px 18px',
                    fontSize: '0.82rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    flexShrink: 0
                }}
            >
                {buttonText} <FaArrowRight size={11} />
            </Link>
        </div>
    );
};

export default SponsorBanner;
