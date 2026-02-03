import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { IoIosArrowDown, IoIosArrowUp, IoMdFlash, IoMdTrophy, IoMdList, IoMdCreate, IoMdLink, IoMdPlay } from 'react-icons/io';
import SEO from './SEO';

const SolutionPage = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeLangs, setActiveLangs] = useState({});
    const [expandedApproaches, setExpandedApproaches] = useState({});
    const [videoVisible, setVideoVisible] = useState(false);

    // Refs for smooth scroll
    const sections = {
        video: useRef(null),
        problem: useRef(null),
        complexity: useRef(null),
        method: useRef(null),
        approaches: useRef(null)
    };

    useEffect(() => {
        const fetchSolution = async (retryCount = 0) => {
            setLoading(true);
            setError('');
            try {
                const API_BASE = import.meta.env.VITE_API_URL || '';
                // Increased timeout to 60s for AI generation
                const response = await axios.get(`${API_BASE}/api/solution/${id}`, {
                    timeout: 60000
                });
                setData(response.data);
            } catch (err) {
                console.error("Fetch Error:", err);

                // If it's a network error or timeout, and we haven't retried yet, try once more
                // This handles cases where the first request triggers generation but times out,
                // and the second one (retry) will likely hit the database.
                if (retryCount < 1 && (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED')) {
                    console.log("Retrying fetch...");
                    setTimeout(() => fetchSolution(retryCount + 1), 2000);
                    return;
                }

                setError('Failed to load solution. The AI generation might be taking longer than expected. Please try refreshing the page.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchSolution();
    }, [id]);

    const scrollToSection = (ref) => {
        if (ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const toggleApproach = (index) => {
        setExpandedApproaches(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const handleLangChange = (approachIndex, lang) => {
        setActiveLangs(prev => ({ ...prev, [approachIndex]: lang }));
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#080808', color: '#fff' }}>
            <div className="loader" style={{ width: '50px', height: '50px', border: '3px solid #333', borderTopColor: '#f57c00', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <h2 style={{ marginTop: '2rem', color: '#888', fontWeight: 400 }}>Crafting your article...</h2>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error || !data) return (
        <div style={{ padding: '4rem', textAlign: 'center', background: '#080808', minHeight: '100vh', color: '#ff6b6b' }}>
            <h2>Oops!</h2>
            <p>{error || 'Solution not found.'}</p>
            <Link to="/" style={{ color: '#fff', marginTop: '2rem', display: 'inline-block' }}>Return Home</Link>
        </div>
    );

    const approaches = data.approaches || [];
    const complexityTable = data.complexityTable || [];
    const topics = data.topics || [];
    const difficulty = data.difficulty || 'Medium';

    return (
        <div className="solution-page-container">
            <SEO title={`${id}. ${data.title} - Full Explanation`} description={data.problemStatement} path={`/solution/${id}`} />

            {/* Main Container */}
            <div className="content-wrapper">

                {/* Content Area */}
                <main className="main-content">
                    <nav style={{ marginBottom: '2rem' }}>
                        <Link to="/top-100-leetcode" style={{ color: '#f57c00', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>‹</span> DSA Sheet
                        </Link>
                    </nav>

                    <header className="article-header">
                        <div className="header-top">
                            <h1 className="problem-title">{id}. {data.title}</h1>
                            <div className="difficulty-tag">
                                <IoMdFlash color="#f57c00" />
                                <span style={{ color: difficulty === 'Hard' ? '#ff4b2b' : difficulty === 'Easy' ? '#00c853' : '#f57c00' }}>{difficulty}</span>
                            </div>
                        </div>

                        <div className="tags-container">
                            <a href={`https://leetcode.com/problems/${data.slug || id}/`} target="_blank" rel="noreferrer" className="practice-link">
                                <IoMdLink /> Practice Here
                            </a>
                            {topics.map(t => (
                                <span key={t} className="topic-tag">#{t}</span>
                            ))}
                        </div>
                    </header>

                    {/* Problem Statement Section */}
                    <section ref={sections.problem} id="problem-statement" className="section-container">
                        <h2 className="section-title">Problem Statement :</h2>
                        <div className="problem-text">{data.problemStatement}</div>


                        <div className="examples-list">
                            {data.examples?.map((ex, idx) => (
                                <div key={idx} className="example-box">
                                    <div className="example-label">Example {idx + 1}:</div>
                                    <div className="example-content">
                                        <strong>Input:</strong> {ex.input}<br />
                                        <strong>Output:</strong> {ex.output}<br />
                                        {ex.explanation && <><strong>Explanation:</strong> {ex.explanation}</>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Approaches Section */}
                    <section ref={sections.approaches} id="approaches">
                        <h2 className="section-title">Approach Breakdown :</h2>
                        {approaches.map((appr, idx) => {
                            const currentLang = activeLangs[idx] || 'python';
                            const isExpanded = expandedApproaches[idx];
                            return (
                                <article key={idx} className={`approach-card ${isExpanded ? 'expanded' : ''}`}>
                                    <button
                                        onClick={() => toggleApproach(idx)}
                                        className="approach-toggle"
                                    >
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
                                                    {(appr.steps || appr.algorithm)?.map((step, sIdx) => <li key={sIdx}>{step}</li>)}
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

                                            {/* Code Tabs */}
                                            <div className="code-section">
                                                <div className="code-header">
                                                    <div className="code-label">Code Implementation</div>
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
                                                        {appr.codes?.[currentLang] || '// Loading code...'}
                                                    </SyntaxHighlighter>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </article>
                            )
                        })}
                    </section>

                    {/* Video Section Toggle */}
                    <div ref={sections.video} className="video-dropdown-container">
                        <button onClick={() => setVideoVisible(!videoVisible)} className="video-toggle-btn">
                            <div className="btn-content"><IoMdPlay color="#f57c00" /> <span>Watch Detailed Video Solution</span></div>
                            {videoVisible ? <IoIosArrowUp /> : <IoIosArrowDown />}
                        </button>
                        {videoVisible && data.video && (
                            <div className="video-frame-wrapper">
                                <iframe width="100%" height="500" src={`https://www.youtube.com/embed/${data.video.id}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                            </div>
                        )}
                    </div>
                </main>

                {/* Sidebar Navigation */}
                <aside className="article-sidebar">
                    <div className="sidebar-nav">
                        <h4>On this page</h4>
                        <ul>
                            <li onClick={() => scrollToSection(sections.video)} className={videoVisible ? 'active' : ''}>Video Tutorial</li>
                            <li onClick={() => scrollToSection(sections.problem)}>Problem Statement</li>
                            <li onClick={() => scrollToSection(sections.complexity)}>Complexity Table</li>
                            {approaches.map((a, i) => (
                                <li key={i} onClick={() => scrollToSection(sections.approaches)} className="sub-item">{i + 1}. {a.name.split(' ')[0]}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="sidebar-card">
                        <IoMdTrophy size={30} color="#f57c00" style={{ marginBottom: '1rem' }} />
                        <div className="card-title">Master Problem Solving</div>
                        <p className="card-text">Practice makes perfect. Try to solve this on LeetCode without hints.</p>
                        <a href={`https://leetcode.com/problems/${data.slug || id}/`} target="_blank" rel="noreferrer" className="practice-link" style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center', background: '#f57c00', color: '#000', border: 'none' }}>
                            Solve on LeetCode
                        </a>
                    </div>
                </aside>
            </div>

            <style>{`
                .solution-page-container {
                     background: #080808;
                     min-height: 100vh;
                     color: #ddd;
                     font-family: 'Outfit', sans-serif;
                     padding-bottom: 6rem;
                }
                .content-wrapper {
                     max-width: 1200px;
                     margin: 0 auto;
                     display: flex;
                     gap: 3rem;
                     padding: 4rem 2rem;
                }
                .main-content { flex: 1; min-width: 0; }
                .problem-title { font-size: 2.8rem; font-weight: 800; color: #fff; margin: 0; }
                .header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .difficulty-tag { display: flex; gap: 0.5rem; alignItems: center; font-weight: 700; font-size: 0.9rem; }
                .tags-container { display: flex; gap: 0.8rem; flex-wrap: wrap; margin-bottom: 3rem; }
                .practice-link { background: #1a1a1a; color: #fff; padding: 0.6rem 1.2rem; border-radius: 50px; text-decoration: none; display: flex; alignItems: center; gap: 0.5rem; font-size: 0.9rem; border: 1px solid #333; transition: 0.3s; }
                .practice-link:hover { border-color: #f57c00; background: #222; }
                .topic-tag { background: rgba(255,255,255,0.05); color: #888; padding: 0.6rem 1.2rem; border-radius: 50px; font-size: 0.85rem; border: 1px solid #222; }

                .video-hero-section { margin-bottom: 4rem; }
                .video-frame-wrapper { border-radius: 24px; overflow: hidden; border: 1px solid #222; background: #000; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }

                .section-container { margin-bottom: 5rem; }
                .section-title { font-size: 1.6rem; color: var(--accent-orange); font-weight: 700; margin-bottom: 1.8rem; display: flex; align-items: center; gap: 1rem; }
                .section-title::before { content: ''; width: 4px; height: 1.2em; background: rgba(245, 124, 0, 0.3); border-radius: 2px; }
                .problem-text { font-size: 1.15rem; line-height: 1.9; color: #ccc; margin-bottom: 2.5rem; }

                .analytical-overview-card { background: #111; padding: 2.5rem; border-radius: 20px; border: 1px solid #222; margin-bottom: 3rem; }
                .analytical-overview-card h3 { color: #fff; margin-top: 0; font-size: 1.3rem; margin-bottom: 1.2rem; }
                .analytical-overview-card p { line-height: 1.8; color: #999; margin: 0; font-size: 1.05rem; }


                .examples-list { display: grid; gap: 1.5rem; }
                .example-box { background: #111; border-radius: 12px; border: 1px solid #222; padding: 1.8rem; }
                .example-label { color: #fff; font-weight: 600; font-size: 1.05rem; margin-bottom: 0.8rem; color: #f57c00; text-transform: uppercase; letter-spacing: 1px; font-size: 0.8rem; }
                .example-content { color: #aaa; font-size: 1rem; line-height: 1.7; white-space: pre-wrap; word-break: break-word; }
                .example-content strong { color: #ddd; font-weight: 600; }

                .complexity-table-wrapper { background: #111; border-radius: 20px; border: 1px solid #222; overflow: hidden; }
                .complexity-table { width: 100%; border-collapse: collapse; text-align: left; }
                .complexity-table th { padding: 1.4rem; font-size: 1.1rem; color: #fff; background: #1a1a1a; font-weight: 700; }
                .complexity-table td { padding: 1.4rem; border-bottom: 1px solid #222; font-size: 1.1rem; }
                .complexity-table tbody tr:last-child td { border-bottom: none; }
                .method-name { color: #fff; font-weight: 600; display: flex; align-items: center; gap: 0.8rem; }
                .info-icon { background: transparent; border: 1px solid #444; color: #f57c00; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 800; cursor: help; }
                .complexity-val { color: #aaa; font-family: monospace; }

                .approach-card { background: #111; border-radius: 24px; border: 1px solid #222; margin-bottom: 1.5rem; overflow: hidden; transition: 0.3s; }
                .approach-toggle { width: 100%; padding: 2.2rem 2.8rem; background: #141414; border: none; display: flex; justify-content: space-between; align-items: center; cursor: pointer; text-align: left; }
                .approach-toggle-left { display: flex; align-items: center; gap: 1.8rem; }
                .approach-number { background: #333; color: #fff; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.95rem; }
                .approach-card.expanded .approach-number { background: #f57c00; color: #000; }
                .approach-card.expanded .approach-toggle { background: #181818; border-bottom: 1px solid #222; }
                .approach-toggle h3 { margin: 0; color: #fff; font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; }
                .approach-details { padding: 0 2.8rem 2.8rem 2.8rem; }
                .concept-text { color: #999; line-height: 1.8; font-size: 1.1rem; margin: 2rem 0; }
                .algo-steps h4 { color: #fff; font-size: 1.1rem; margin-bottom: 1.2rem; }
                .algo-steps ol { color: #888; line-height: 2; padding-left: 1.5rem; font-size: 1.05rem; }
                
                .complexity-stats { display: flex; gap: 1.2rem; margin: 3rem 0; }
                .stat-card { flex: 1; background: #1a1a1a; padding: 1.8rem; border-radius: 16px; border: 1px solid #222; text-align: center; }
                .stat-label { color: #666; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.8rem; }
                .stat-value { color: #f57c00; font-size: 1.35rem; font-weight: 700; font-family: monospace; }

                .code-section { background: #000; border-radius: 20px; border: 1px solid #333; overflow: hidden; }
                .code-header { border-bottom: 1px solid #222; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; background: #0f0f0f; }
                .code-label { color: #888; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
                .lang-tabs { display: flex; gap: 0.5rem; }
                .lang-tab { background: transparent; border: none; padding: 0.5rem 1rem; color: #555; cursor: pointer; font-weight: 600; border-radius: 6px; transition: 0.2s; font-size: 0.85rem; }
                .lang-tab.active { color: #fff; background: #222; }
                .code-container { padding: 1rem; }

                .video-dropdown-container { margin-top: 5rem; border-top: 1px solid #222; padding-top: 4rem; }
                .video-toggle-btn { width: 100%; padding: 1.8rem; background: #111; border: 1px solid #252525; border-radius: 16px; color: #fff; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: 0.2s; }
                .video-toggle-btn:hover { border-color: #444; }
                .btn-content { display: flex; align-items: center; gap: 1.2rem; font-weight: 700; font-size: 1.1rem; }
                .video-frame-wrapper { margin-top: 1.5rem; border-radius: 20px; overflow: hidden; border: 1px solid #333; background: #000; }

                .article-sidebar { width: 280px; position: sticky; top: 4rem; height: fit-content; }
                .sidebar-nav { padding-left: 2rem; border-left: 1px solid #222; margin-bottom: 4rem; }
                .sidebar-nav h4 { color: #fff; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1.8rem; }
                .sidebar-nav ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 1.2rem; }
                .sidebar-nav li { cursor: pointer; color: #777; font-size: 0.95rem; transition: 0.2s; }
                .sidebar-nav li:hover { color: #f57c00; }
                .sidebar-nav li.sub-item { padding-left: 1.2rem; font-size: 0.85rem; color: #555; }
                .sidebar-card { background: linear-gradient(135deg, #161616 0%, #000 100%); padding: 2rem; border-radius: 20px; border: 1px solid #252525; }
                .card-title { color: #fff; font-weight: 800; font-size: 1rem; margin-bottom: 0.8rem; }
                .card-text { color: #666; font-size: 0.85rem; line-height: 1.6; margin: 0; }

                @media (max-width: 1000px) {
                    .content-wrapper { flex-direction: column; padding: 3rem 1.5rem; }
                    .article-sidebar { display: none; }
                    .problem-title { font-size: 2.2rem; }
                    .approach-toggle { padding: 1.8rem; }
                    .approach-details { padding: 0 1.8rem 1.8rem 1.8rem; }
                    .header-top { flex-direction: column; align-items: flex-start; gap: 1rem; }
                    .section-title { font-size: 1.4rem; }
                    .problem-text { font-size: 1.05rem; }
                }

                @media (max-width: 600px) {
                    .complexity-table th, .complexity-table td { padding: 1rem; font-size: 0.95rem; }
                    .complexity-stats { flex-direction: column; }
                    .approach-toggle h3 { font-size: 1.2rem; }
                    .problem-title { font-size: 1.8rem; }
                }
            `}</style>
        </div>
    );
};

export default SolutionPage;
