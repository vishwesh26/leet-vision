import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaInstagram, FaLinkedin, FaGithub, FaBuilding, FaPlay, FaPause, FaRedo } from 'react-icons/fa';
import SEO from './SEO';
import EzoicAd from './ads/EzoicAd';
import DotField from './DotField';
import '../homepage.css';

/* ═══════════════════════════════════════════════════════════════════
   Reusable Sub-components
   ═══════════════════════════════════════════════════════════════════ */

/** Browser Mockup — monochrome dots, orange active, fake URL */
const BrowserMockup = ({ url = 'leet-vision.com', children }) => (
    <div className="hp-browser">
        <div className="hp-browser-bar">
            <div className="hp-browser-dots">
                <div className="hp-browser-dot hp-browser-dot--red" />
                <div className="hp-browser-dot hp-browser-dot--yellow" />
                <div className="hp-browser-dot hp-browser-dot--green" />
            </div>
            <div className="hp-browser-url">{url}</div>
        </div>
        <div className="hp-browser-body">
            {children}
        </div>
    </div>
);

/** Scroll-triggered reveal — guaranteed visibility */
const SectionReveal = ({ children, className = '', style }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
            { threshold: 0.05 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={`hp-reveal ${visible ? 'hp-visible' : ''} ${className}`} style={style}>
            {children}
        </div>
    );
};

/** FAQ Accordion Item */
const FAQItem = ({ num, question, answer }) => {
    const [open, setOpen] = useState(false);
    const contentRef = useRef(null);

    return (
        <div className="hp-faq-item">
            <button className="hp-faq-trigger" onClick={() => setOpen(!open)} aria-expanded={open}>
                <span className="hp-faq-num">{num}</span>
                <span className="hp-faq-question">{question}</span>
                <span className={`hp-faq-toggle ${open ? 'hp-faq-toggle--open' : ''}`}>+</span>
            </button>
            <div
                className="hp-faq-answer"
                style={{ maxHeight: open ? `${contentRef.current?.scrollHeight || 200}px` : '0', opacity: open ? 1 : 0 }}
            >
                <div ref={contentRef} className="hp-faq-answer-inner">{answer}</div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════
   LIVE HISTOGRAM / CONTAINER ANIMATED VISUALIZER (LeetCode #11 / #42)
   Exact replica of the real HistogramScene visualizer engine
   ═══════════════════════════════════════════════════════════════════ */

const containerTrace = [
    { line: 6, left: 0, right: 8, maxArea: 8, curArea: 8, h: 1, w: 8 },
    { line: 12, left: 0, right: 8, maxArea: 8, curArea: 8, h: 1, w: 8 },
    { line: 17, left: 1, right: 8, maxArea: 49, curArea: 49, h: 7, w: 7 },
    { line: 12, left: 1, right: 8, maxArea: 49, curArea: 49, h: 7, w: 7 },
    { line: 19, left: 1, right: 7, maxArea: 49, curArea: 18, h: 3, w: 6 },
    { line: 19, left: 1, right: 6, maxArea: 49, curArea: 40, h: 8, w: 5 },
    { line: 17, left: 2, right: 6, maxArea: 49, curArea: 24, h: 6, w: 4 },
    { line: 17, left: 3, right: 6, maxArea: 49, curArea: 6, h: 2, w: 3 },
    { line: 17, left: 4, right: 6, maxArea: 49, curArea: 10, h: 5, w: 2 },
    { line: 17, left: 5, right: 6, maxArea: 49, curArea: 4, h: 4, w: 1 },
];

const containerHeights = [1, 8, 6, 2, 5, 4, 8, 3, 7];
const maxVal = 8;
const MAX_BAR_PX = 180;
const BAR_WIDTH = 24;

const LiveHistogramVisualizer = () => {
    const [step, setStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    useEffect(() => {
        // Disable auto-play animation on small mobile screens to save CPU & battery
        const isMobile = window.innerWidth <= 768;
        if (!isPlaying || isMobile) return;
        const interval = setInterval(() => {
            setStep((prev) => (prev + 1) % containerTrace.length);
        }, 1500);
        return () => clearInterval(interval);
    }, [isPlaying]);

    const cur = containerTrace[step];
    const leftVal = containerHeights[cur.left];
    const rightVal = containerHeights[cur.right];

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="hp-viz-mock">
                {/* Left Panel: ALGORITHMIC PSEUDOCODE */}
                <div className="hp-viz-code">
                    <div className="hp-viz-code-header">ALGORITHMIC PSEUDOCODE</div>
                    {[
                        { num: 1, text: <><span className="kw">ALGORITHM</span> <span className="fn">maxArea</span>(height):</>, line: 1 },
                        { num: 2, text: <>&nbsp;&nbsp;<span className="kw">INITIALIZE</span> <span className="var">left</span> <span className="op">=</span> <span className="num">0</span></>, line: 2 },
                        { num: 3, text: <>&nbsp;&nbsp;<span className="kw">INITIALIZE</span> <span className="var">right</span> <span className="op">=</span> <span className="fn">length</span>(height) <span className="op">-</span> <span className="num">1</span></>, line: 3 },
                        { num: 4, text: <>&nbsp;&nbsp;<span className="kw">INITIALIZE</span> <span className="var">maxArea</span> <span className="op">=</span> <span className="num">0</span></>, line: 4 },
                        { num: 5, text: <>&nbsp;</>, line: 5 },
                        { num: 6, text: <>&nbsp;&nbsp;<span className="kw">WHILE</span> left <span className="op">&lt;</span> right <span className="kw">DO</span></>, line: 6 },
                        { num: 7, text: <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="var">h</span> <span className="op">=</span> <span className="fn">min</span>(height[left], height[right])</>, line: 7 },
                        { num: 8, text: <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="var">w</span> <span className="op">=</span> right <span className="op">-</span> left</>, line: 8 },
                        { num: 9, text: <>&nbsp;&nbsp;&nbsp;&nbsp;maxArea <span className="op">=</span> <span className="fn">max</span>(maxArea, h <span className="op">*</span> w)</>, line: 9 },
                        { num: 10, text: <>&nbsp;</>, line: 10 },
                        { num: 11, text: <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="kw">IF</span> height[left] <span className="op">&lt;</span> height[right] <span className="kw">THEN</span></>, line: 11 },
                        { num: 12, text: <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;left <span className="op">=</span> left <span className="op">+</span> <span className="num">1</span></>, line: 12 },
                        { num: 13, text: <>&nbsp;&nbsp;&nbsp;&nbsp;<span className="kw">ELSE</span></>, line: 13 },
                        { num: 14, text: <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;right <span className="op">=</span> right <span className="op">-</span> <span className="num">1</span></>, line: 14 },
                        { num: 15, text: <>&nbsp;</>, line: 15 },
                        { num: 16, text: <>&nbsp;&nbsp;<span className="kw">RETURN</span> maxArea</>, line: 16 },
                    ].map((row) => (
                        <div key={row.num} className={`hp-viz-code-line ${row.line === cur.line ? 'hp-viz-code-line--active' : ''}`}>
                            <span className="hp-viz-line-num">{row.num}</span>
                            <span className="hp-viz-line-text">{row.text}</span>
                        </div>
                    ))}
                </div>

                {/* Right Panel: VISUALIZATION */}
                <div className="hp-viz-canvas">
                    <div className="hp-viz-canvas-header">VISUALIZATION</div>

                    {/* Stats Dashboard */}
                    <div style={{
                        display: 'flex', gap: '30px', background: '#111', padding: '10px 24px',
                        borderRadius: '10px', border: '1px solid #222', marginBottom: '20px', zIndex: 2
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '0.62rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>CURRENT AREA</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f57c00', fontFamily: 'var(--hp-font-mono)', marginTop: '2px' }}>
                                {cur.w} <span style={{ color: '#555' }}>×</span> {cur.h} <span style={{ color: '#555' }}>=</span> <span style={{ color: '#2196f3' }}>{cur.curArea}</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', borderLeft: '1px solid #333', paddingLeft: '30px' }}>
                            <div style={{ fontSize: '0.62rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>MAX AREA FOUND</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--hp-font-mono)' }}>
                                {cur.maxArea}
                            </div>
                        </div>
                    </div>

                    {/* Histogram Canvas */}
                    <div style={{
                        display: 'flex', alignItems: 'flex-end', gap: '6px',
                        borderBottom: '2px solid #333', paddingBottom: '4px',
                        position: 'relative', height: '220px', width: '100%', justifyContent: 'center'
                    }}>
                        {/* Water Area Overlay */}
                        {cur.left < cur.right && (
                            <div style={{
                                position: 'absolute',
                                left: `calc(50% - ${((containerHeights.length * (BAR_WIDTH + 6)) - 6) / 2}px + ${cur.left * (BAR_WIDTH + 6)}px + ${BAR_WIDTH / 2}px)`,
                                width: (cur.right - cur.left) * (BAR_WIDTH + 6),
                                bottom: 4,
                                height: (cur.h / maxVal) * MAX_BAR_PX,
                                background: 'rgba(33, 150, 243, 0.25)',
                                border: '1px solid rgba(33, 150, 243, 0.5)',
                                borderBottom: 'none',
                                zIndex: 1,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
                            }}>
                                <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)', fontFamily: 'var(--hp-font-mono)' }}>
                                    {cur.curArea}
                                </span>
                            </div>
                        )}

                        {containerHeights.map((val, idx) => {
                            const isLeft = idx === cur.left;
                            const isRight = idx === cur.right;
                            const isActive = isLeft || isRight;
                            const pxHeight = Math.max(4, (val / maxVal) * MAX_BAR_PX);

                            let bg = 'rgba(255, 255, 255, 0.1)';
                            let border = '1px solid rgba(255, 255, 255, 0.2)';
                            if (isLeft) { bg = 'rgba(33, 150, 243, 0.8)'; border = '1px solid #64b5f6'; }
                            else if (isRight) { bg = 'rgba(245, 124, 0, 0.8)'; border = '1px solid #ffb74d'; }

                            return (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 2 }}>
                                    {/* Height Label */}
                                    <div style={{ fontSize: '0.7rem', color: isActive ? '#fff' : '#666', fontWeight: isActive ? 700 : 400, fontFamily: 'monospace', height: 14 }}>
                                        {val}
                                    </div>

                                    {/* Bar */}
                                    <div style={{
                                        width: BAR_WIDTH,
                                        height: pxHeight,
                                        background: bg,
                                        border: border,
                                        borderRadius: '4px 4px 0 0',
                                        transition: 'all 0.3s ease'
                                    }} />

                                    {/* Pointer & Index Label */}
                                    <div style={{ height: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        {isLeft && <div style={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: '5px solid #2196f3' }} />}
                                        {isRight && <div style={{ width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: '5px solid #f57c00' }} />}
                                        <div style={{ fontSize: '0.62rem', color: '#444', fontFamily: 'monospace' }}>{idx}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Playback Control Bar */}
            <div className="hp-viz-playback">
                <button className="hp-viz-ctrl-btn" onClick={() => setStep(0)} title="Reset"><FaRedo size={10} /></button>
                <button className="hp-viz-play-btn" onClick={() => setIsPlaying(!isPlaying)} title={isPlaying ? "Pause" : "Play"}>
                    {isPlaying ? <FaPause size={10} /> : <FaPlay size={10} />}
                </button>
                <div className="hp-viz-scrubber">
                    <div className="hp-viz-scrubber-fill" style={{ width: `${((step + 1) / containerTrace.length) * 100}%` }} />
                </div>
                <div className="hp-viz-speed">1x LIVE</div>
            </div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════════
   Roadmap Mockup — Topic-Wise & Difficulty-Wise
   ═══════════════════════════════════════════════════════════════════ */
const RoadmapMockup = () => (
    <div style={{ padding: '20px', fontFamily: 'var(--hp-font-mono)', fontSize: '0.72rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--hp-accent)', fontWeight: 700, fontSize: '0.9rem' }}>✦</span>
                <span style={{ color: '#ccc', fontSize: '0.85rem', fontFamily: 'var(--hp-font-body)', fontWeight: 600 }}>Topic-Wise & Difficulty-Wise Roadmaps</span>
            </div>
            <span style={{ color: '#666', fontSize: '0.7rem' }}>10 Units · 150 Problems</span>
        </div>
        {[
            { unit: 'TOPIC 1', title: 'Arrays & Two Pointers', diff: 'Easy to Medium', count: '30 problems', icon: '🟢' },
            { unit: 'TOPIC 2', title: 'Strings & Hashing', diff: 'Easy to Medium', count: '25 problems', icon: '🟡' },
            { unit: 'TOPIC 3', title: 'Stack & Monotonic Queue', diff: 'Medium', count: '20 problems', icon: '🟠' },
            { unit: 'TOPIC 4', title: 'Trees & Binary Search Trees', diff: 'Medium to Hard', count: '25 problems', icon: '🔵' },
            { unit: 'TOPIC 5', title: 'Dynamic Programming & Graphs', diff: 'Medium to Hard', count: '30 problems', icon: '⚡' },
        ].map((row, i) => (
            <div key={i} style={{
                display: 'grid', gridTemplateColumns: '28px 1fr 110px 80px',
                alignItems: 'center', gap: '10px',
                padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
                <span style={{ fontSize: '1rem' }}>{row.icon}</span>
                <div>
                    <div style={{ color: '#ccc', fontSize: '0.78rem', fontFamily: 'var(--hp-font-body)', fontWeight: 500 }}>{row.title}</div>
                    <div style={{ color: '#555', fontSize: '0.65rem', marginTop: '2px' }}>{row.unit}</div>
                </div>
                <span style={{ color: '#ffa116', fontSize: '0.68rem', background: 'rgba(255,161,22,0.1)', padding: '2px 8px', borderRadius: '10px', textAlign: 'center' }}>{row.diff}</span>
                <span style={{ color: '#666', fontSize: '0.68rem', textAlign: 'right' }}>{row.count}</span>
            </div>
        ))}
    </div>
);

/* ═══════════════════════════════════════════════════════════════════
   Company & Category Mockup for Positioning Section
   ═══════════════════════════════════════════════════════════════════ */
const CompanyCategoryMockup = () => (
    <div style={{ padding: '24px', fontFamily: 'var(--hp-font-mono)', fontSize: '0.75rem' }}>
        <div style={{ color: '#888', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
            Target Top Companies & Core Topics
        </div>
        
        {/* Company Pills Grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
            {[
                { name: 'Google', count: '180+', domain: 'google.com' },
                { name: 'Meta', count: '150+', domain: 'meta.com' },
                { name: 'Amazon', count: '210+', domain: 'amazon.com' },
                { name: 'Microsoft', count: '140+', domain: 'microsoft.com' },
                { name: 'Apple', count: '90+', domain: 'apple.com' },
                { name: 'Netflix', count: '45+', domain: 'netflix.com' },
                { name: 'Uber', count: '80+', domain: 'uber.com' },
                { name: 'Airbnb', count: '60+', domain: 'airbnb.com' },
            ].map((comp, idx) => (
                <div key={comp.name} style={{
                    background: idx === 0 ? 'rgba(245, 124, 0, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    border: idx === 0 ? '1px solid var(--hp-accent)' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: idx === 0 ? 'var(--hp-accent)' : '#ccc',
                    padding: '6px 14px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600,
                    display: 'inline-flex', alignItems: 'center', gap: '8px'
                }}>
                    <img
                        src={`https://www.google.com/s2/favicons?domain=${comp.domain}&sz=64`}
                        alt={`${comp.name} logo`}
                        style={{ width: '14px', height: '14px', borderRadius: '2px', objectFit: 'contain' }}
                    />
                    <span>{comp.name} ({comp.count})</span>
                </div>
            ))}
        </div>

        {/* Topic Filters */}
        <div style={{ color: '#888', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Filtered By Topic & Difficulty
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(0,184,163,0.15)', color: '#00b8a3', border: '1px solid rgba(0,184,163,0.3)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem' }}>Easy (120)</span>
            <span style={{ background: 'rgba(255,192,30,0.15)', color: '#ffc01e', border: '1px solid rgba(255,192,30,0.3)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem' }}>Medium (280)</span>
            <span style={{ background: 'rgba(255,55,95,0.15)', color: '#ff375f', border: '1px solid rgba(255,55,95,0.3)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem' }}>Hard (95)</span>
            <span style={{ background: 'rgba(255,255,255,0.05)', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem' }}>Arrays</span>
            <span style={{ background: 'rgba(255,255,255,0.05)', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem' }}>Dynamic Programming</span>
            <span style={{ background: 'rgba(255,255,255,0.05)', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem' }}>Binary Trees</span>
        </div>
    </div>
);

/* ═══════════════════════════════════════════════════════════════════
   FAQ Data
   ═══════════════════════════════════════════════════════════════════ */
const faqData = [
    {
        q: 'What is LeetVision?',
        a: 'LeetVision is a visual coding preparation platform. We index thousands of LeetCode problems and organize them by company-wise frequency, topic-wise patterns, and difficulty levels, paired with step-by-step visual algorithm execution.'
    },
    {
        q: 'Can I search questions by Company and Topic?',
        a: 'Yes! LeetVision provides dedicated company-wise interview pages for 340+ top tech companies (Google, Meta, Amazon, Microsoft, etc.) as well as topic-wise categories (Arrays, Strings, Trees, Graphs, DP) and difficulty levels (Easy, Medium, Hard).'
    },
    {
        q: 'Is LeetVision free to use?',
        a: 'Yes — LeetVision is completely free. Access all company question sets, topic roadmaps, visual algorithm execution, and our browser extension at no cost.'
    },
    {
        q: 'How does the Visualizer help me understand algorithms?',
        a: 'Rather than reading text editorials where you must mentally simulate pointer movements or recursion, LeetVision dynamically animates code execution in real time—showing pointers move, data structures update, and state variables change.'
    },
    {
        q: 'Does the extension work directly on LeetCode?',
        a: 'Yes. The LeetVision extension integrates directly into leetcode.com, identifying the problem ID and loading visual guides and solutions without requiring you to switch tabs.'
    },
    {
        q: 'Can I track my solved problems?',
        a: 'Yes. Connect your LeetCode username to automatically sync your solved history against company sets and topic roadmaps.'
    },
];

/* ═══════════════════════════════════════════════════════════════════
   LandingPage Component
   ═══════════════════════════════════════════════════════════════════ */
const LandingPage = () => {
    return (
        <div className="hp-page" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Interactive DotField Background from React Bits (Homepage Only) */}
            <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
                <DotField
                    dotRadius={1}
                    dotSpacing={30}
                    bulgeStrength={28}
                    glowRadius={120}
                    sparkle={false}
                    waveAmplitude={0}
                    cursorRadius={550}
                    cursorForce={0.12}
                    gradientFrom="#fb942eff"
                    gradientTo="#f6a26a99"
                    glowColor="#ffffff26"
                />
                {/* Black Vignette Overlay — keeps only center background visible */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(ellipse at center, transparent 20%, rgba(10, 10, 10, 0.8) 85%)',
                    pointerEvents: 'none',
                    zIndex: 2
                }} />
            </div>

            <SEO
                title="LeetVision — Visual Coding Preparation, Company Questions & DSA Roadmaps"
                description="Master Data Structures and Algorithms with step-by-step visual algorithm animations, 340+ company-specific interview questions, topic-wise roadmaps, and browser tools."
                path="/"
            />

            {/* ── HERO ─────────────────────────────────────────────── */}
            <section className="hp-hero">
                <div className="hp-hero-left">
                    <div className="hp-eyebrow hp-stagger hp-stagger-1">VISUAL DSA PREP & COMPANY QUESTIONS</div>

                    <h1 className="hp-heading hp-heading-xl" style={{ marginBottom: '1.5rem' }}>
                        <span className="hp-stagger hp-stagger-2" style={{ display: 'block' }}>Stop reading.</span>
                        <span className="hp-stagger hp-stagger-3" style={{ display: 'block' }}>Start visualizing.</span>
                    </h1>

                    <p className="hp-body hp-stagger hp-stagger-4">
                        Master coding interviews through <strong>live algorithm animations</strong>, 
                        <strong> company-wise question sets</strong> for 340+ tech companies, 
                        <strong> topic-wise DSA roadmaps</strong>, and structured difficulty paths.
                    </p>

                    {/* Feature Badges */}
                    <div className="hp-stagger hp-stagger-5" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '1.5rem 0' }}>
                        <span className="hp-mono" style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '12px', color: '#ccc' }}>🏢 340+ Companies</span>
                        <span className="hp-mono" style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '12px', color: '#ccc' }}>📚 Topic-Wise Roadmaps</span>
                        <span className="hp-mono" style={{ fontSize: '0.7rem', background: 'rgba(245,124,0,0.15)', padding: '4px 10px', borderRadius: '12px', color: 'var(--hp-accent)' }}>⚡ Live Algorithm Animations</span>
                    </div>

                    <div className="hp-hero-ctas hp-stagger hp-stagger-6">
                        <Link to="/basic-to-advance" className="hp-btn-primary">
                            Explore All Questions <FaArrowRight size={14} />
                        </Link>
                        <Link to="/companies" className="hp-btn-ghost">
                            <FaBuilding size={14} style={{ marginRight: '6px' }} /> Company Questions
                        </Link>
                    </div>

                    <div className="hp-hero-caption hp-stagger hp-stagger-6">
                        Free to use · No credit card required
                    </div>
                </div>

                <div className="hp-hero-right hp-stagger hp-stagger-4">
                    <BrowserMockup url="leet-vision.com/solution/11">
                        <LiveHistogramVisualizer />
                    </BrowserMockup>
                </div>
            </section>

            {/* ── 2. MARQUEE STATS STRIP ──────────────────────────────── */}
            <div className="hp-marquee-strip">
                <div className="hp-marquee-track">
                    {[1, 2].map(loop => (
                        <React.Fragment key={loop}>
                            <MarqueeStat value="3,000+" label="Problems Indexed" />
                            <span className="hp-marquee-sep">·</span>
                            <MarqueeStat value="340+" label="Companies Covered" />
                            <span className="hp-marquee-sep">·</span>
                            <MarqueeStat value="Topic-Wise" label="Arrays, Trees, DP, Graphs" />
                            <span className="hp-marquee-sep">·</span>
                            <MarqueeStat value="Difficulty-Wise" label="Easy · Medium · Hard" />
                            <span className="hp-marquee-sep">·</span>
                            <MarqueeStat value="150" label="Curated Roadmap Problems" />
                            <span className="hp-marquee-sep">·</span>
                            <MarqueeStat value="Free" label="To Access" />
                            <span className="hp-marquee-sep">·</span>
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* ── 3. FEATURE SHOWCASE ─────────────────────────────────── */}
            <section className="hp-section hp-section-centered">
                <SectionReveal>
                    <div className="hp-eyebrow">ROADMAPS & TOPIC PATTERNS</div>
                    <h2 className="hp-heading hp-heading-lg" style={{ marginBottom: '1rem' }}>
                        Solve by topic.<br />Master core patterns.
                    </h2>
                    <p className="hp-body" style={{ textAlign: 'center', margin: '0 auto 3rem' }}>
                        Browse problems categorized by topic (Arrays, Strings, Trees, Graphs, Dynamic Programming)
                        and difficulty (Easy, Medium, Hard). Build structured pattern recognition that scales across interviews.
                    </p>
                </SectionReveal>

                <SectionReveal style={{ width: '100%', maxWidth: '750px' }}>
                    <BrowserMockup url="leet-vision.com/basic-to-advance">
                        <RoadmapMockup />
                    </BrowserMockup>
                </SectionReveal>
            </section>

            <EzoicAd />

            {/* ── 4. COMPANY-WISE & TOPIC-WISE POSITIONING SECTION ────── */}
            <section className="hp-section hp-section-split">
                <SectionReveal>
                    <div className="hp-eyebrow">COMPANY-SPECIFIC INTERVIEW PREP</div>
                    <h2 className="hp-heading hp-heading-lg" style={{ marginBottom: '1.5rem' }}>
                        Target questions asked by<br />Google, Meta & 340+ Companies.
                    </h2>
                    <p className="hp-body">
                        Don't waste time solving random problems. LeetVision organizes questions by company frequency so you focus on what top-tier engineering teams are actively asking right now.
                    </p>
                    <ul className="hp-dot-list">
                        <li><strong>Company-wise filtering:</strong> Dedicated sets for Google, Amazon, Meta, Microsoft, Apple & more</li>
                        <li><strong>Topic & Difficulty tagging:</strong> Filter by Arrays, Trees, DP, and Easy/Medium/Hard</li>
                        <li><strong>Live algorithm execution:</strong> Visualize hard questions step-by-step</li>
                    </ul>
                </SectionReveal>

                <SectionReveal>
                    <BrowserMockup url="leet-vision.com/companies">
                        <CompanyCategoryMockup />
                    </BrowserMockup>
                </SectionReveal>
            </section>

            {/* ── 5. CAPABILITIES ──────────────────────────────────────── */}
            <section className="hp-section">
                <SectionReveal>
                    <div className="hp-eyebrow" style={{ textAlign: 'center' }}>ALL PLATFORM CAPABILITIES</div>
                    <h2 className="hp-heading hp-heading-lg" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        Everything you need.<br />Organized for success.
                    </h2>
                </SectionReveal>

                <div className="hp-capabilities">
                    {[
                        {
                            num: '01',
                            title: 'Live Algorithm Visualizer',
                            desc: 'Step-by-step visual execution of algorithms like Container With Most Water, Trapping Rain Water, Two Sum, Binary Search, and Tree traversals. See pointers move, heights calculate, and areas compute dynamically synchronized with code.'
                        },
                        {
                            num: '02',
                            title: '340+ Company Question Sets',
                            desc: 'Direct insights into questions asked at top tech companies. Filter by Google, Meta, Amazon, Microsoft, Apple, Uber, Netflix, and more to make your prep targeted and efficient.'
                        },
                        {
                            num: '03',
                            title: 'Topic & Difficulty Categorization',
                            desc: 'Explore problems structured by topic (Arrays, Strings, Trees, Graphs, DP) and difficulty (Easy, Medium, Hard) so you can strengthen weak areas systematically.'
                        },
                        {
                            num: '04',
                            title: 'Curated Video Solutions',
                            desc: 'Hand-picked video walkthroughs for frequently asked interview questions from top creators, giving you instant clarity without searching YouTube.'
                        },
                        {
                            num: '05',
                            title: 'Browser Extension',
                            desc: 'Watch solutions and visual guides directly inside LeetCode without switching tabs or losing your flow state.'
                        },
                    ].map(cap => (
                        <SectionReveal key={cap.num}>
                            <div className="hp-capability-row">
                                <div className="hp-capability-num">{cap.num}</div>
                                <div>
                                    <div className="hp-capability-title">{cap.title}</div>
                                    <div className="hp-capability-desc">{cap.desc}</div>
                                </div>
                            </div>
                        </SectionReveal>
                    ))}
                </div>
            </section>

            <EzoicAd />

            {/* ── 6. FAQ ───────────────────────────────────────────────── */}
            <section className="hp-section hp-section-centered">
                <SectionReveal>
                    <div className="hp-eyebrow">FAQ</div>
                    <h2 className="hp-heading hp-heading-lg" style={{ marginBottom: '3rem' }}>
                        Questions, answered.
                    </h2>
                </SectionReveal>

                <div className="hp-faq-list">
                    {faqData.map((faq, i) => (
                        <SectionReveal key={i}>
                            <FAQItem num={String(i + 1).padStart(2, '0')} question={faq.q} answer={faq.a} />
                        </SectionReveal>
                    ))}
                </div>
            </section>

            {/* ── 7. FINAL CTA ─────────────────────────────────────────── */}
            <section className="hp-final-cta">
                <SectionReveal>
                    <h2 className="hp-heading hp-heading-lg" style={{ marginBottom: '1rem' }}>
                        Start practicing today.
                    </h2>
                    <p className="hp-mono" style={{ fontSize: '0.75rem', color: 'var(--hp-fg-muted)', marginBottom: '2rem', letterSpacing: '0.1em' }}>
                        FREE TO USE · NO CREDIT CARD
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/companies" className="hp-btn-primary">
                            Browse Companies <FaArrowRight size={14} />
                        </Link>
                        <Link to="/basic-to-advance" className="hp-btn-ghost">
                            View DSA Roadmap
                        </Link>
                    </div>
                </SectionReveal>

                <div className="hp-final-watermark" aria-hidden="true">leet-vision</div>
                <div className="hp-final-accent" aria-hidden="true" />
            </section>

            <EzoicAd />

            {/* ── 8. FOOTER ────────────────────────────────────────────── */}
            <footer className="hp-footer">
                <div className="hp-footer-top">
                    <div className="hp-footer-brand">
                        <div className="hp-footer-wordmark">leet-vision<span>.</span></div>
                        <p className="hp-footer-tagline">
                            Master Data Structures & Algorithms with live visual solutions,
                            340+ company question sets, and topic-wise roadmaps.
                        </p>
                    </div>

                    <div className="hp-footer-col">
                        <div className="hp-footer-col-title">Explore</div>
                        <Link to="/companies">Company Questions</Link>
                        <Link to="/basic-to-advance">DSA Roadmap</Link>
                        <Link to="/leetcode-easy">Easy Questions</Link>
                        <Link to="/leetcode-medium">Medium Questions</Link>
                        <Link to="/leetcode-hard">Hard Questions</Link>
                    </div>

                    <div className="hp-footer-col">
                        <div className="hp-footer-col-title">Topics</div>
                        <Link to="/topics/array">Arrays</Link>
                        <Link to="/topics/string">Strings</Link>
                        <Link to="/topics/tree">Trees</Link>
                        <Link to="/topics/graph">Graphs</Link>
                        <Link to="/topics/Dynamic Programming">Dynamic Programming</Link>
                    </div>

                    <div className="hp-footer-col">
                        <div className="hp-footer-col-title">Platform</div>
                        <Link to="/about">About</Link>
                        <a href="/docs">Docs</a>
                        <Link to="/how-it-works">How It Works</Link>
                        <Link to="/privacy-policy">Privacy Policy</Link>
                    </div>
                </div>

                <div className="hp-footer-bottom">
                    <div className="hp-footer-copy">© {new Date().getFullYear()} LeetVision. Built by Vishwesh Shinde.</div>
                    <div className="hp-footer-socials">
                        <a href="https://github.com/vishwesh26" target="_blank" rel="noreferrer" aria-label="GitHub"><FaGithub size={18} /></a>
                        <a href="https://www.instagram.com/vishwesh_shinde" target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram size={18} /></a>
                        <a href="https://www.linkedin.com/in/vishweshshinde" target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedin size={18} /></a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

/** Marquee stat helper */
const MarqueeStat = ({ value, label }) => (
    <div className="hp-marquee-item">
        <span className="hp-marquee-value">{value}</span>
        <span className="hp-marquee-label">{label}</span>
    </div>
);

export default LandingPage;
