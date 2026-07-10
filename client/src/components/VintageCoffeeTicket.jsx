// Rebuild trigger: 2026-07-11T02:47:58
import React from 'react';
import { useNavigate } from 'react-router-dom';

const VintageCoffeeTicket = () => {
    const navigate = useNavigate();

    return (
        <div 
            className="vintage-ticket-wrapper" 
            onClick={() => navigate('/buy-me-a-coffee')}
            role="button"
            tabIndex={0}
            aria-label="Buy me a coffee - Support Leet-Vision"
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    navigate('/buy-me-a-coffee');
                }
            }}
        >
            {/* SVG ClipPath Definition */}
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                    <clipPath id="ticket-clip" clipPathUnits="objectBoundingBox">
                        <path d="M 0 0 
                                 L 1 0 
                                 L 1 0.35 
                                 C 0.93 0.35, 0.93 0.55, 1 0.55 
                                 L 1 0.82 
                                 Q 0.98 0.84, 0.96 0.81 Q 0.94 0.85, 0.92 0.82 Q 0.90 0.85, 0.88 0.81 Q 0.86 0.85, 0.84 0.82
                                 Q 0.82 0.85, 0.80 0.81 Q 0.78 0.85, 0.76 0.82 Q 0.74 0.85, 0.72 0.82 Q 0.70 0.85, 0.68 0.82
                                 Q 0.66 0.85, 0.64 0.81 Q 0.62 0.85, 0.60 0.82 Q 0.58 0.85, 0.56 0.81 Q 0.54 0.85, 0.52 0.82
                                 Q 0.50 0.85, 0.48 0.81 Q 0.46 0.85, 0.44 0.82 Q 0.42 0.85, 0.40 0.81 Q 0.38 0.85, 0.36 0.82
                                 Q 0.34 0.85, 0.32 0.81 Q 0.30 0.85, 0.28 0.82 Q 0.26 0.85, 0.24 0.81 Q 0.22 0.85, 0.20 0.82
                                 Q 0.18 0.85, 0.16 0.81 Q 0.14 0.85, 0.12 0.82 Q 0.10 0.85, 0.08 0.81 Q 0.06 0.85, 0.04 0.82
                                 Q 0.02 0.85, 0 0.82 Z" />
                    </clipPath>
                </defs>
            </svg>

            {/* Tape Overlay */}
            <div className="ticket-tape"></div>

            {/* Main Ticket Card */}
            <div className="ticket-body">
                {/* Vintage details */}
                <div className="ticket-info">
                    <div className="ticket-stamp">KEEP THE LIGHTS ON</div>
                    <div className="ticket-serial">Nº 4920412</div>
                </div>

                <div className="ticket-content">
                    <div className="ticket-text">
                        <span className="ticket-line-1">Buy me</span>
                        <span className="ticket-line-2">a coffee</span>
                    </div>
                </div>

                {/* Golden circular action button */}
                <div className="ticket-gold-btn">
                    <svg className="arrow-svg" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#4B2E1F" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="12" x2="20" y2="12" />
                        <polyline points="14 6 20 12 14 18" />
                    </svg>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Outfit:wght@400;600;700&display=swap');

                :root {
                    --ticket-bg: #F3E7D3;
                    --ticket-text-color: #4B2E1F;
                    --gold-gradient-start: #FFC247;
                    --gold-gradient-end: #F4A000;
                    --gold-gradient-start-hover: #FFCD66;
                    --gold-gradient-end-hover: #FFA805;
                }

                .vintage-ticket-wrapper {
                    position: relative;
                    width: 100%;
                    max-width: 520px;
                    margin: 2rem auto;
                    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.35));
                    cursor: pointer;
                    transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), filter 0.3s ease;
                    outline: none;
                }

                .vintage-ticket-wrapper:focus-visible {
                    outline: 2px solid var(--gold-gradient-start);
                    outline-offset: 8px;
                    border-radius: 8px;
                }

                /* Masking Tape */
                .ticket-tape {
                    position: absolute;
                    top: -16px;
                    left: 45%;
                    transform: translateX(-50%) rotate(-2deg);
                    width: 130px;
                    height: 30px;
                    background: #c3a997b3;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
                    backdrop-filter: blur(1px);
                    z-index: 10;
                    border-left: 2px dashed rgba(255,255,255,0.4);
                    border-right: 2px dashed rgba(255,255,255,0.4);
                    transition: transform 0.3s ease;
                }

                /* Main Body */
                .ticket-body {
                    background-color: var(--ticket-bg);
                    background-image: 
                        radial-gradient(circle at 10% 20%, rgba(75, 46, 31, 0.02) 0%, transparent 60%),
                        url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
                    clip-path: url(#ticket-clip);
                    padding: 2.2rem 2rem 2.8rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                    min-height: 125px;
                    box-sizing: border-box;
                    transition: background 0.3s ease;
                    border: 1px solid rgba(75, 46, 31, 0.05);
                }

                /* Ticket Serial Stamp */
                .ticket-info {
                    position: absolute;
                    top: 15px;
                    left: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    opacity: 0.55;
                }
                .ticket-stamp {
                    font-size: 0.55rem;
                    font-weight: 800;
                    letter-spacing: 1px;
                    color: var(--ticket-text-color);
                    text-transform: uppercase;
                }
                .ticket-serial {
                    font-family: monospace;
                    font-size: 0.55rem;
                    color: var(--ticket-text-color);
                }

                /* Typography */
                .ticket-content {
                    display: flex;
                    flex-direction: column;
                }
                .ticket-text {
                    display: flex;
                    flex-direction: column;
                    font-family: 'Caveat', cursive;
                    color: var(--ticket-text-color);
                    line-height: 0.9;
                    margin-top: 0.5rem;
                    transform: rotate(-1.5deg);
                }
                .ticket-line-1 {
                    font-size: 2rem;
                    font-weight: 700;
                }
                .ticket-line-2 {
                    font-size: 2.6rem;
                    font-weight: 800;
                    margin-left: 0.5rem;
                }

                /* Golden circular action button */
                .ticket-gold-btn {
                    width: 72px;
                    height: 72px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--gold-gradient-start) 0%, var(--gold-gradient-end) 100%);
                    box-shadow: 
                        0 4px 10px rgba(244, 160, 0, 0.3),
                        inset 0 2px 4px rgba(255, 255, 255, 0.3),
                        inset 0 -3px 6px rgba(0, 0, 0, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.3s ease;
                    z-index: 5;
                    border: 1px solid rgba(255,255,255,0.1);
                    position: relative;
                }

                /* Glossy highlight line on button */
                .ticket-gold-btn::after {
                    content: '';
                    position: absolute;
                    top: 4px;
                    left: 12px;
                    width: 48px;
                    height: 24px;
                    background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%);
                    border-radius: 50% 50% 0 0;
                    transform: rotate(-10deg);
                }

                .arrow-svg {
                    transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
                }

                /* Hover States */
                .vintage-ticket-wrapper:hover {
                    transform: translateY(-6px) rotate(1deg);
                    filter: drop-shadow(0 14px 24px rgba(0, 0, 0, 0.45));
                }

                .vintage-ticket-wrapper:hover .ticket-tape {
                    animation: tapeWiggle 0.6s ease-in-out infinite alternate;
                }

                .vintage-ticket-wrapper:hover .ticket-gold-btn {
                    transform: scale(1.08);
                    background: linear-gradient(135deg, var(--gold-gradient-start-hover) 0%, var(--gold-gradient-end-hover) 100%);
                    box-shadow: 
                        0 6px 14px rgba(244, 160, 0, 0.4),
                        inset 0 2px 4px rgba(255, 255, 255, 0.45),
                        inset 0 -3px 6px rgba(0, 0, 0, 0.12);
                }

                .vintage-ticket-wrapper:hover .arrow-svg {
                    transform: translateX(4px);
                }

                /* Active States */
                .vintage-ticket-wrapper:active {
                    transform: translateY(-2px) rotate(0.5deg);
                    filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.38));
                }

                .vintage-ticket-wrapper:active .ticket-gold-btn {
                    transform: scale(0.96);
                }

                @keyframes tapeWiggle {
                    0% { transform: translateX(-50%) rotate(-2deg); }
                    100% { transform: translateX(-50%) rotate(-0.5deg); }
                }

                /* Responsive adaptations */
                @media (max-width: 768px) {
                    .vintage-ticket-wrapper {
                        max-width: 420px;
                    }
                    .ticket-line-1 { font-size: 1.8rem; }
                    .ticket-line-2 { font-size: 2.3rem; }
                    .ticket-gold-btn { width: 64px; height: 64px; }
                }

                @media (max-width: 480px) {
                    .vintage-ticket-wrapper {
                        max-width: 100%;
                        margin: 1.5rem 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default VintageCoffeeTicket;
