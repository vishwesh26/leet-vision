import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaTimes, FaBuilding, FaRocket } from 'react-icons/fa';

// --- Confetti Particle ---
const COLORS = ['#f57c00', '#ffc107', '#ffffff', '#ff7043', '#ffeb3b', '#ff8f00'];

const random = (min, max) => Math.random() * (max - min) + min;

const createParticles = (count) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: random(10, 90),          // % from left
        y: random(-20, -5),         // start above viewport
        size: random(6, 14),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        speed: random(2, 5),
        angle: random(-30, 30),     // degrees of drift
        rotation: random(0, 360),
        rotationSpeed: random(-5, 5),
        shape: Math.random() > 0.5 ? 'circle' : 'rect',
        delay: random(0, 1),        // seconds delay
    }));
};

const WelcomePopup = () => {
    const [visible, setVisible] = useState(false);
    const [closing, setClosing] = useState(false);
    const [particles, setParticles] = useState([]);
    const animFrameRef = useRef(null);
    const particleStatesRef = useRef([]);
    const canvasRef = useRef(null);

    useEffect(() => {
        const hasSeen = localStorage.getItem('lv_welcome_seen');
        if (!hasSeen) {
            // Small delay so page renders first
            const timer = setTimeout(() => {
                setVisible(true);
                const p = createParticles(120);
                setParticles(p);
                particleStatesRef.current = p.map(p => ({
                    ...p,
                    currentY: p.y,
                    currentX: p.x,
                    currentRotation: p.rotation,
                    opacity: 1
                }));
            }, 400);
            return () => clearTimeout(timer);
        }
    }, []);

    // Canvas-based confetti animation
    useEffect(() => {
        if (!visible || particles.length === 0) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let states = particles.map(p => ({
            x: (p.x / 100) * canvas.width,
            y: (p.y / 100) * canvas.height,
            size: p.size,
            color: p.color,
            speed: p.speed * 3,
            drift: p.angle * 0.05,
            rotation: p.rotation,
            rotationSpeed: p.rotationSpeed * 4,
            shape: p.shape,
            opacity: 0,
            delay: p.delay * 60, // frames
            frame: 0,
        }));

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let allDone = true;

            states.forEach(s => {
                s.frame++;
                if (s.frame < s.delay) { allDone = false; return; }

                // Fade in
                if (s.opacity < 1) s.opacity = Math.min(1, s.opacity + 0.05);

                s.y += s.speed;
                s.x += s.drift;
                s.rotation += s.rotationSpeed;

                // Fade out when near bottom
                if (s.y > canvas.height * 0.6) {
                    s.opacity = Math.max(0, s.opacity - 0.02);
                }

                if (s.y < canvas.height + 50 && s.opacity > 0) allDone = false;

                ctx.save();
                ctx.globalAlpha = s.opacity;
                ctx.translate(s.x, s.y);
                ctx.rotate((s.rotation * Math.PI) / 180);
                ctx.fillStyle = s.color;

                if (s.shape === 'circle') {
                    ctx.beginPath();
                    ctx.arc(0, 0, s.size / 2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillRect(-s.size / 2, -s.size / 4, s.size, s.size / 2);
                }

                ctx.restore();
            });

            if (!allDone) {
                animFrameRef.current = requestAnimationFrame(draw);
            }
        };

        animFrameRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animFrameRef.current);
    }, [visible, particles]);

    const handleClose = () => {
        setClosing(true);
        cancelAnimationFrame(animFrameRef.current);
        setTimeout(() => {
            setVisible(false);
            localStorage.setItem('lv_welcome_seen', 'true');
        }, 400);
    };

    if (!visible) return null;

    return (
        <>
            {/* Full-screen canvas for confetti */}
            <canvas
                ref={canvasRef}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 9998,
                    pointerEvents: 'none',
                }}
            />

            {/* Backdrop */}
            <div
                onClick={handleClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(6px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    animation: closing ? 'popupFadeOut 0.4s ease forwards' : 'popupFadeIn 0.4s ease forwards',
                }}
            >
                {/* Modal */}
                <div
                    onClick={e => e.stopPropagation()}
                    style={{
                        background: '#111',
                        border: '1px solid #333',
                        borderRadius: '24px',
                        padding: '3rem 2.5rem',
                        maxWidth: '500px',
                        width: '100%',
                        textAlign: 'center',
                        position: 'relative',
                        boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
                        animation: closing ? 'modalSlideOut 0.4s cubic-bezier(0.4, 0, 1, 1) forwards' : 'modalSlideIn 0.5s cubic-bezier(0, 0, 0.2, 1.4) forwards',
                    }}
                >
                    {/* Close Button */}
                    <button
                        onClick={handleClose}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid #333',
                            color: '#888',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    >
                        <FaTimes />
                    </button>

                    {/* Top glow accent */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '80%',
                        height: '2px',
                        background: 'linear-gradient(90deg, transparent, var(--accent-orange), transparent)',
                        borderRadius: '2px',
                    }} />

                    {/* Emoji */}
                    <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>

                    {/* Welcome text */}
                    <div style={{
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        letterSpacing: '3px',
                        color: 'var(--accent-orange)',
                        textTransform: 'uppercase',
                        marginBottom: '1rem',
                    }}>
                        Welcome to LeetVision
                    </div>

                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        color: 'white',
                        margin: '0 0 1rem 0',
                        lineHeight: '1.3',
                    }}>
                        Your Dream Company's<br />Questions Are Now{' '}
                        <span style={{ color: 'var(--accent-orange)' }}>Freeeeeeeee......! 🚀</span>
                    </h2>

                    <p style={{
                        color: '#888',
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        margin: '0 0 2rem 0',
                    }}>
                        No subscriptions. Just log in and start cracking interviews.
                    </p>

                    {/* CTA Buttons */}
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link
                            to="/companies"
                            onClick={handleClose}
                            style={{
                                background: 'var(--accent-orange)',
                                color: 'white',
                                padding: '0.85rem 2rem',
                                borderRadius: '50px',
                                fontWeight: '700',
                                fontSize: '0.95rem',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 8px 20px rgba(245, 124, 0, 0.35)',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(245, 124, 0, 0.45)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 124, 0, 0.35)'; }}
                        >
                            <FaBuilding size={14} /> Explore Companies
                        </Link>
                        
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes popupFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes popupFadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                @keyframes modalSlideIn {
                    from { opacity: 0; transform: scale(0.85) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes modalSlideOut {
                    from { opacity: 1; transform: scale(1) translateY(0); }
                    to { opacity: 0; transform: scale(0.9) translateY(10px); }
                }
            `}</style>
        </>
    );
};

export default WelcomePopup;
