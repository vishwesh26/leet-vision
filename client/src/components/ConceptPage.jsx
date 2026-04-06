import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaLightbulb, FaExchangeAlt, FaYoutube, FaCode, FaCheckCircle, FaChevronRight, FaBrain, FaExternalLinkAlt, FaTerminal, FaInfoCircle } from 'react-icons/fa';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { IoIosArrowDown, IoIosArrowUp, IoMdCreate } from 'react-icons/io';
import SEO from './SEO';
import { FaCoffee, FaBug } from 'react-icons/fa';


const PremiumLoader = ({ platform }) => {
    const [msgIdx, setMsgIdx] = useState(0);
    const messages = platform
        ? [
            "Searching the darkest corners of the codebase...",
            "Persuading the compiler to be nice...",
            "Brewing a fresh pot of coffee...",
            "Untangling the spaghetti code...",
            "Reversing the binary tree..."
        ]
        : [
            "Reading the mystical documentation...",
            "Asking rubber duck for advice...",
            "Defragmenting memory...",
            "Downloading more RAM...",
            "Waiting for tests to pass..."
        ];

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIdx(prev => (prev + 1) % messages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [messages.length]);

    const icons = [<FaCode className="brain-icon-premium" style={{animation: 'spin 3s linear infinite'}} key="1" />, <FaCoffee className="brain-icon-premium" style={{animation: 'bounce 2s infinite'}} key="2" />, <FaBug className="brain-icon-premium" style={{animation: 'pulse 1.5s infinite'}} key="3" />];

    return (
        <div className="premium-loader-container">
            <div className="brain-pulse-wrapper">
                <div className="brain-glow" style={{ background: 'rgba(245, 124, 0, 0.3)' }}></div>
                {icons[msgIdx % 3]}
            </div>
            <div className="loading-status-container">
                <h2 className="loading-title-premium" style={{ animation: 'pulse 2s infinite' }}>Loading Solution...</h2>
                <p className="loading-msg-premium" key={msgIdx} style={{ animation: 'fadeInUp 0.5s ease-out' }}>{messages[msgIdx]}</p>
            </div>
            <div className="loading-progress-bar">
                <div className="loading-progress-fill"></div>
            </div>
        </div>
    );
};

const ConceptPage = () => {
    const { id, platform, slug } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedApproaches, setExpandedApproaches] = useState({ 0: true });
    const [activeLangs, setActiveLangs] = useState({});

    // Refs for scrolling
    const sections = {
        problem: useRef(null),
        complexity: useRef(null),
        approaches: useRef(null),
        video: useRef(null)
    };

    useEffect(() => {
        const fetchConcept = async () => {
            try {
                setLoading(true);
                const API_BASE = import.meta.env.VITE_API_URL || '';

                let endpoint = `${API_BASE}/api/concept/${id}`;
                if (platform && slug) {
                    endpoint = `${API_BASE}/api/universe/resolve/${platform}/${slug}`;
                }

                const response = await axios.get(endpoint);
                setData(response.data);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.error || "Failed to load concept details.");
            } finally {
                setLoading(false);
            }
        };
        fetchConcept();
    }, [id, platform, slug]);

    const toggleApproach = (idx) => {
        setExpandedApproaches(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const handleLangChange = (approachIdx, lang) => {
        setActiveLangs(prev => ({ ...prev, [approachIdx]: lang }));
    };

    const scrollToSection = (ref) => {
        if (ref.current) {
            window.scrollTo({ top: ref.current.offsetTop - 100, behavior: 'smooth' });
        }
    };

    if (loading) return <PremiumLoader platform={platform} />;

    if (error || !data) return (
        <div className="error-container-concept">
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: '#fff' }}>
                {error.includes('over-clocked') ? "Neurons Over-Clocked" : "System Outage"}
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#888', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                {error.includes('over-clocked')
                    ? "Our Intelligence Layer is currently processing too many requests. Please wait about 60 seconds for the neural nodes to cool down."
                    : error || "We couldn't retrieve the knowledge mapping for this sector."}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button onClick={() => window.location.reload()} className="practice-link" style={{ background: 'var(--accent-orange)', color: '#000', border: 'none' }}>
                    Retry Fusion
                </button>
                <Link to="/explore" className="practice-link">Return to Universe</Link>
            </div>
        </div>
    );

    const { concept, explanation, relatedProblems } = data;
    const approaches = explanation.approaches || [];

    return (
        <div className="concept-detail-page">
            <SEO title={`${concept.concept_key.replace(/_/g, ' ')} - Intelligence Layer`} description={explanation.analytical_overview?.substring(0, 160)} />

            <div className="concept-content-wrapper">
                <main className="concept-main">
                    <nav className="breadcrumb">
                        <Link to="/explore">All Platform Problem</Link>
                        <FaChevronRight size={10} />
                        <span>Loading Article</span>
                    </nav>

                    <header className="concept-header-premium">
                        <div className="concept-topic-badge">Knowledge Graph / {concept.topic}</div>
                        <h1 className="concept-title">{concept.concept_key.replace(/_/g, ' ')}</h1>
                        <div className="concept-meta-tags">
                            <span className="concept-pattern-tag">{concept.pattern}</span>
                            <span className={`diff-badge ${concept.difficulty_estimate.toLowerCase()}`}>
                                {concept.difficulty_estimate}
                            </span>
                        </div>
                    </header>


                    {/* Section 2: Analytical Overview */}
                    {explanation.analytical_overview && (
                        <section className="concept-section section-container">
                            <h3 className="section-title">Deep Analysis</h3>
                            <div className="analytical-overview-card">
                                <p>{explanation.analytical_overview}</p>
                            </div>
                        </section>
                    )}



                    {/* Section 4: Complexity Table */}
                    {explanation.complexity_table && explanation.complexity_table.length > 0 && (
                        <section ref={sections.complexity} className="concept-section section-container">
                            <h3 className="section-title">Efficiency Metrics</h3>
                            <div className="complexity-table-wrapper">
                                <table className="complexity-table">
                                    <thead>
                                        <tr>
                                            <th>Methodology</th>
                                            <th>Time</th>
                                            <th>Space</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {explanation.complexity_table.map((row, i) => (
                                            <tr key={i}>
                                                <td className="method-name">
                                                    {row.method}
                                                    <span className="info-icon" title="Big O measurement">?</span>
                                                </td>
                                                <td className="complexity-val">{row.time}</td>
                                                <td className="complexity-val">{row.space}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* Section 5: Approaches */}
                    <section ref={sections.approaches} className="concept-section section-container">
                        <h3 className="section-title">Strategic Patterns</h3>
                        {approaches.length > 0 ? (
                            approaches.map((appr, idx) => {
                                const currentLang = activeLangs[idx] || 'python';
                                const isExpanded = expandedApproaches[idx];
                                return (
                                    <article key={idx} className={`approach-card ${isExpanded ? 'expanded' : ''}`}>
                                        <button onClick={() => toggleApproach(idx)} className="approach-toggle">
                                            <div className="approach-toggle-left">
                                                <div className="approach-number">{idx + 1}</div>
                                                <h3>{appr.name}</h3>
                                            </div>
                                            {isExpanded ? <IoIosArrowUp color="#f57c00" size={24} /> : <IoIosArrowDown color="#888" size={24} />}
                                        </button>

                                        {isExpanded && (
                                            <div className="approach-details">
                                                <p className="concept-text">{appr.concept}</p>

                                                <div className="algo-steps">
                                                    <h4>Algorithm Steps:</h4>
                                                    <ol>
                                                        {appr.steps?.map((step, sIdx) => <li key={sIdx}>{step}</li>)}
                                                    </ol>
                                                </div>

                                                <div className="complexity-stats">
                                                    <div className="stat-card">
                                                        <div className="stat-label">Time Complexity</div>
                                                        <div className="stat-value">{appr.complexity?.time}</div>
                                                    </div>
                                                    <div className="stat-card">
                                                        <div className="stat-label">Space Complexity</div>
                                                        <div className="stat-value">{appr.complexity?.space}</div>
                                                    </div>
                                                </div>

                                                <div className="code-section">
                                                    <div className="code-header">
                                                        <div className="code-label">Implementation</div>
                                                        <div className="lang-tabs">
                                                            {['cpp', 'java', 'python', 'javascript'].map(l => (
                                                                <button
                                                                    key={l}
                                                                    onClick={(e) => { e.stopPropagation(); handleLangChange(idx, l); }}
                                                                    className={`lang-tab ${currentLang === l ? 'active' : ''}`}
                                                                >
                                                                    {l === 'cpp' ? 'C++' : l.charAt(0).toUpperCase() + l.slice(1)}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="code-container">
                                                        <SyntaxHighlighter
                                                            language={currentLang}
                                                            style={vscDarkPlus}
                                                            customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.9rem', lineHeight: 1.6, background: 'transparent' }}
                                                            showLineNumbers
                                                        >
                                                            {appr.codes?.[currentLang] || '// Logical pattern not implemented for this language yet.'}
                                                        </SyntaxHighlighter>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </article>
                                );
                            })
                        ) : (
                            <div className="card-style" style={{ textAlign: 'center', opacity: 0.5 }}>
                                <FaTerminal size={40} style={{ marginBottom: '1rem' }} />
                                <p>This concept uses a unified logic pattern across all targeted platforms.</p>
                            </div>
                        )}
                    </section>
                </main>

                <aside className="concept-sidebar">
                    <section className="sidebar-nav-card shadow-premium">
                        <h4 className="sidebar-mini-title">On this page</h4>
                        <ul className="sidebar-nav-links">
                            <li onClick={() => scrollToSection(sections.problem)}>Mental Model</li>
                            <li onClick={() => scrollToSection(sections.complexity)}>Efficiency Metrics</li>
                            <li onClick={() => scrollToSection(sections.approaches)}>Strategic Patterns</li>
                        </ul>
                    </section>

                    <section className="sidebar-group shadow-premium">
                        <h3 className="sidebar-title"><FaExchangeAlt /> Target Platforms</h3>
                        <div className="sidebar-info">This logic is mapped across these domains:</div>
                        <div className="mapping-list">
                            {relatedProblems.map(p => (
                                <a key={p._id} href={p.url} target="_blank" rel="noreferrer" className="mapping-card">
                                    <div className="mapping-platform">{p.platform}</div>
                                    <div className="mapping-title">{p.title}</div>
                                </a>
                            ))}
                        </div>
                    </section>

                    {explanation.video_links && explanation.video_links.length > 0 && (
                        <section className="sidebar-group shadow-premium">
                            <h3 className="sidebar-title"><FaYoutube color="#ff0000" /> Curated Guides</h3>
                            <div className="video-stack">
                                {explanation.video_links.map((v, i) => (
                                    <a key={i} href={v.url} target="_blank" rel="noreferrer" className="premium-video-card">
                                        <div className="video-preview">
                                            <img src={v.thumbnail} alt={v.title} />
                                            <span className="vid-duration">{v.duration}</span>
                                        </div>
                                        <div className="vid-details">
                                            <div className="vid-title">{v.title}</div>
                                            <div className="vid-views">{Math.floor(v.views / 1000)}K views</div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Report Issue Button */}
                    <div style={{ marginTop: '30px', textAlign: 'center' }}>
                        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>Found solution wrong?</p>
                        <button
                            onClick={() => navigate('/report-solution', {
                                state: {
                                    questionId: id || slug,
                                    title: concept.concept_key.replace(/_/g, ' '),
                                    platform: platform || 'Universal'
                                }
                            })}
                            style={{
                                background: 'transparent',
                                border: '1px solid #333',
                                color: '#888',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                width: '100%',
                                justifyContent: 'center',
                                transition: '0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.borderColor = '#ff5252';
                                e.target.style.color = '#ff5252';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.borderColor = '#333';
                                e.target.style.color = '#888';
                            }}
                        >
                            <IoMdCreate /> Report Issue
                        </button>
                    </div>
                </aside>
            </div>

            <style>{`
                .concept-detail-page {
                    background: #080808;
                    min-height: 100vh;
                    color: #ddd;
                    font-family: 'Outfit', sans-serif;
                    padding-bottom: 5rem;
                }
                .concept-content-wrapper {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    gap: 3rem;
                    padding: 4rem 2rem;
                }
                .concept-main { flex: 1; min-width: 0; }
                .breadcrumb { display: flex; align-items: center; gap: 0.8rem; font-size: 0.85rem; color: #666; margin-bottom: 2rem; }
                .breadcrumb a { color: var(--accent-orange); text-decoration: none; }
                .concept-header-premium { margin-bottom: 4rem; }
                .concept-topic-badge { color: var(--accent-orange); text-transform: uppercase; font-size: 0.8rem; font-weight: 700; letter-spacing: 2px; margin-bottom: 1rem; }
                .concept-title { font-size: 2.8rem; font-weight: 800; color: #fff; margin: 0; text-transform: capitalize; }
                .concept-meta-tags { display: flex; gap: 1rem; margin-top: 1.5rem; }
                .concept-pattern-tag { background: rgba(255,255,255,0.05); color: #888; padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.85rem; border: 1px solid #222; }
                .diff-badge { padding: 0.5rem 1rem; border-radius: 50px; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; }
                .diff-badge.easy { color: #00c853; background: rgba(0, 200, 83, 0.1); }
                .diff-badge.medium { color: #f57c00; background: rgba(245, 124, 0, 0.1); }
                .diff-badge.hard { color: #ff4b2b; background: rgba(255, 75, 43, 0.1); }

                .card-style { background: #111; padding: 2.5rem; border-radius: 20px; border: 1px solid #222; margin-bottom: 3rem; }
                .section-header { font-size: 1.4rem; color: #fff; display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
                .intuition-para { font-size: 1.15rem; line-height: 1.8; color: #ccc; }

                .section-container { margin-bottom: 5rem; }
                .section-title { font-size: 1.6rem; color: var(--accent-orange); font-weight: 700; margin-bottom: 1.8rem; display: flex; align-items: center; gap: 1rem; }
                .section-title::before { content: ''; width: 4px; height: 1.2em; background: rgba(245, 124, 0, 0.3); border-radius: 2px; }

                .analytical-overview-card { background: #111; padding: 2.5rem; border-radius: 20px; border: 1px solid #222; margin-bottom: 3rem; }
                .analytical-overview-card p { line-height: 1.8; color: #ccc; margin: 0; font-size: 1.1rem; }

                .examples-list { display: grid; gap: 1.5rem; }
                .example-box { background: #111; border-radius: 12px; border: 1px solid #222; padding: 1.8rem; }
                .example-label { color: #f57c00; text-transform: uppercase; letter-spacing: 1px; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.8rem; }
                .example-content { color: #aaa; font-size: 1rem; line-height: 1.7; font-family: 'JetBrains Mono', monospace; }

                .complexity-table-wrapper { background: #111; border-radius: 20px; border: 1px solid #222; overflow: hidden; }
                .complexity-table { width: 100%; border-collapse: collapse; text-align: left; }
                .complexity-table th { padding: 1.4rem; font-size: 1.1rem; color: #fff; background: #1a1a1a; font-weight: 700; }
                .complexity-table td { padding: 1.4rem; border-bottom: 1px solid #222; font-size: 1.1rem; color: #aaa; }
                .method-name { color: #fff; font-weight: 600; display: flex; align-items: center; gap: 0.8rem; }
                .info-icon { background: transparent; border: 1px solid #444; color: #f57c00; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; cursor: help; }

                .approach-card { background: #111; border-radius: 24px; border: 1px solid #222; margin-bottom: 1.5rem; overflow: hidden; transition: 0.3s; }
                .approach-toggle { width: 100%; padding: 2rem 2.5rem; background: #141414; border: none; display: flex; justify-content: space-between; align-items: center; cursor: pointer; text-align: left; }
                .approach-toggle-left { display: flex; align-items: center; gap: 1.5rem; }
                .approach-number { background: #333; color: #fff; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; }
                .approach-card.expanded .approach-number { background: var(--accent-orange); color: #000; }
                .approach-toggle h3 { margin: 0; color: #fff; font-size: 1.3rem; font-weight: 700; }
                .approach-details { padding: 0 2.5rem 2.5rem 2.5rem; }
                .concept-text { color: #999; line-height: 1.8; font-size: 1.1rem; margin: 2rem 0; }
                .algo-steps h4 { color: #fff; font-size: 1rem; margin-bottom: 1.2rem; }
                .algo-steps ol { color: #888; line-height: 2; padding-left: 1.5rem; }

                .complexity-stats { display: flex; gap: 1.2rem; margin: 3rem 0; }
                .stat-card { flex: 1; background: #1a1a1a; padding: 1.5rem; border-radius: 16px; border: 1px solid #222; text-align: center; }
                .stat-label { color: #666; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem; }
                .stat-value { color: var(--accent-orange); font-size: 1.2rem; font-weight: 700; font-family: monospace; }

                .code-section { background: #000; border-radius: 20px; border: 1px solid #333; overflow: hidden; }
                .code-header { border-bottom: 1px solid #222; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; background: #0f0f0f; }
                .code-label { color: #888; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }
                .lang-tabs { display: flex; gap: 0.3rem; }
                .lang-tab { background: transparent; border: none; padding: 0.4rem 0.8rem; color: #555; cursor: pointer; font-weight: 600; border-radius: 6px; font-size: 0.8rem; }
                .lang-tab.active { color: #fff; background: #222; }

                .concept-sidebar { width: 300px; position: sticky; top: 6rem; height: fit-content; }
                .sidebar-nav-card { background: #111; border: 1px solid #222; border-radius: 20px; padding: 1.5rem; margin-bottom: 2rem; }
                .sidebar-mini-title { font-size: 0.75rem; text-transform: uppercase; color: #555; letter-spacing: 1px; margin-bottom: 1.2rem; }
                .sidebar-nav-links { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.8rem; }
                .sidebar-nav-links li { font-size: 0.9rem; color: #888; cursor: pointer; transition: 0.2s; }
                .sidebar-nav-links li:hover { color: var(--accent-orange); }

                .sidebar-group { background: #111; border: 1px solid #222; border-radius: 20px; padding: 1.8rem; margin-bottom: 2rem; }
                .sidebar-title { font-size: 1.1rem; color: #fff; margin-bottom: 1rem; display: flex; align-items: center; gap: 10px; }
                .sidebar-info { font-size: 0.85rem; color: #666; line-height: 1.5; margin-bottom: 1.5rem; }
                
                .mapping-card { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 12px; display: block; text-decoration: none; color: #fff; margin-bottom: 10px; transition: 0.2s; }
                .mapping-card:hover { border-color: var(--accent-orange); background: #222; }
                .mapping-platform { font-size: 0.7rem; text-transform: uppercase; color: #888; margin-bottom: 4px; }
                .mapping-title { font-weight: 500; font-size: 0.9rem; }

                .video-stack { display: flex; flex-direction: column; gap: 1.2rem; }
                .premium-video-card { display: flex; gap: 12px; text-decoration: none; transition: 0.2s; }
                .video-preview { position: relative; width: 100px; height: 56px; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
                .video-preview img { width: 100%; height: 100%; object-fit: cover; }
                .vid-duration { position: absolute; bottom: 2px; right: 2px; background: rgba(0,0,0,0.8); color: #fff; font-size: 0.6rem; padding: 1px 4px; border-radius: 2px; }
                .vid-details { min-width: 0; }
                .vid-title { color: #ccc; font-size: 0.8rem; line-height: 1.3; font-weight: 500; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .vid-views { color: #666; font-size: 0.75rem; }
                .premium-video-card:hover .vid-title { color: var(--accent-orange); }

                .loading-container-concept { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justifyContent: center; background: #080808; color: #fff; }
                .loader-concept { width: 50px; height: 50px; border: 3px solid #333; borderTopColor: #f57c00; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }

                .shadow-premium { box-shadow: 0 10px 30px rgba(0,0,0,0.4); }

                .error-container-concept { padding: 4rem; textAlign: center; background: #080808; min-height: 100vh; color: #ff6b6b; }
                .btn-back { color: #fff; marginTop: 2rem; display: inline-block; }

                @media (max-width: 1000px) {
                    .concept-content-wrapper { flex-direction: column; padding: 2rem 1rem; }
                    .concept-sidebar { width: 100%; position: static; }
                    .concept-title { font-size: 2.2rem; }
                }
            `}</style>
        </div>
    );
};

export default ConceptPage;
