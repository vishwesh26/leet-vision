import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { IoIosArrowDown, IoIosArrowUp, IoMdFlash, IoMdCopy, IoMdCheckmark, IoMdLink, IoMdSettings, IoMdPlay, IoMdTrophy, IoMdList, IoMdCreate } from 'react-icons/io';
import { FaPlay, FaExclamationTriangle, FaBrain, FaBookOpen } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import SEO from './SEO';
import VintageCoffeeTicket from './VintageCoffeeTicket';
import SkeletonLoader from './SkeletonLoader';
import EzoicAd from './ads/EzoicAd';

const ArticleSkeleton = () => (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        <SkeletonLoader variant="title" itemStyle={{ height: '40px', width: '60%', marginBottom: '20px' }} />
        <SkeletonLoader variant="text" count={3} itemStyle={{ height: '20px', marginBottom: '10px' }} />
        <br />
        <SkeletonLoader variant="card" itemStyle={{ height: '200px', marginBottom: '30px', borderRadius: '12px' }} />
        <SkeletonLoader variant="title" itemStyle={{ height: '30px', width: '40%', marginBottom: '20px' }} />
        <SkeletonLoader variant="text" count={5} itemStyle={{ height: '20px', marginBottom: '10px' }} />
    </div>
);

const SolutionPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
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
        let ignore = false;

        const fetchSolution = async (retryCount = 0) => {
            if (!ignore) {
                setLoading(true);
                setError('');
            }

            try {
                const API_BASE = import.meta.env.VITE_API_URL || '';
                // Increased timeout to 60s for AI generation
                const response = await axios.get(`${API_BASE}/api/solution/${id}`, {
                    timeout: 60000
                });

                if (!ignore) {
                    setData(response.data);
                    setError('');
                }
            } catch (err) {
                if (ignore) return;

                console.error("Fetch Error:", err);

                // If it's a network error or timeout, and we haven't retried yet, try once more
                if (retryCount < 1 && (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED' || err.response?.status === 500)) {
                    console.log("Retrying fetch...");
                    setTimeout(() => {
                        if (!ignore) fetchSolution(retryCount + 1);
                    }, 2000);
                    return;
                }

                setError(err.response?.data?.error || err.response?.data?.details || 'Failed to load solution. The AI generation might be taking longer than expected. Please try refreshing the page.');
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        if (id) fetchSolution();

        return () => {
            ignore = true;
        };
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

    if (loading) return <ArticleSkeleton />;

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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {user?.isAdmin && (
                                    <button
                                        onClick={() => navigate(`/admin/edit-solution/${id}`)}
                                        style={{ background: 'rgba(245, 124, 0, 0.1)', border: '1px solid #f57c00', color: '#f57c00', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        <IoMdSettings /> Edit Solution
                                    </button>
                                )}
                                <div className="difficulty-tag">
                                    <IoMdFlash color="#f57c00" />
                                    <span style={{ color: difficulty === 'Hard' ? '#ff4b2b' : difficulty === 'Easy' ? '#00c853' : '#f57c00' }}>{difficulty}</span>
                                </div>
                            </div>
                        </div>

                        <div className="tags-container">
                            <a href={data.url || `https://leetcode.com/problems/${data.slug || id}/`} target="_blank" rel="noreferrer" className="practice-link">
                                <IoMdLink /> Practice {data.platform && data.platform !== 'leetcode' ? `on ${data.platform.toUpperCase()}` : 'Here'}
                            </a>
                            {topics.map(t => (
                                <span key={t} className="topic-tag">#{t}</span>
                            ))}
                        </div>
                    </header>

                    {/* Resources Box */}
                    <div style={{ margin: '20px 0' }}>
                        <Link to="/resources" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px', 
                            padding: '16px 20px', 
                            background: 'linear-gradient(145deg, #1a1a1a, #0f0f0f)', 
                            border: '1px solid #333', 
                            borderRadius: '12px', 
                            textDecoration: 'none', 
                            color: '#fff',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                            transition: 'transform 0.2s, border-color 0.2s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4db6ac'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <div style={{ background: 'rgba(77, 182, 172, 0.1)', padding: '10px', borderRadius: '8px', color: '#4db6ac' }}>
                                <FaBookOpen size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#4db6ac' }}>Recommended Resources</h3>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#888' }}>Explore curated books for DSA, System Design, and Interview Prep.</p>
                            </div>
                            <div style={{ color: '#666' }}>
                                <IoMdLink size={20} />
                            </div>
                        </Link>
                    </div>

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

                    {/* Ad Placement after Problem Statement */}
                    <EzoicAd />
                    {/* Analytical Overview Section */}
                    {data.analyticalOverview && (
                        <section id="analytical-overview" className="section-container">
                            <div className="analytical-overview-card">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
                                    <FaBrain color="#f57c00" />
                                    <h3 style={{ margin: 0 }}>Analytical Overview</h3>
                                </div>
                                <p>{data.analyticalOverview}</p>
                            </div>
                        </section>
                    )}

                    {/* Complexity Table Section */}
                    {complexityTable.length > 0 && (
                        <section ref={sections.complexity} id="complexity-section" className="section-container">
                            <h2 className="section-title">Complexity Analysis :</h2>
                            <div className="complexity-table-wrapper">
                                <table className="complexity-table">
                                    <thead>
                                        <tr>
                                            <th>Method</th>
                                            <th>Time</th>
                                            <th>Space</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {complexityTable.map((row, idx) => (
                                            <tr key={idx}>
                                                <td className="method-name">
                                                    {row.method}
                                                    <span className="info-icon" title="Theoretical complexity analysis">?</span>
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

                    {/* Approaches Section */}
                    <section ref={sections.approaches} id="approaches">
                        <h2 className="section-title">Approach Breakdown :</h2>
                        {approaches.map((appr, idx) => {
                            const currentLang = activeLangs[idx] || 'python';
                            const isExpanded = expandedApproaches[idx];
                            return (
                                <React.Fragment key={idx}>
                                    {idx > 0 && <EzoicAd />}
                                    <article className={`approach-card ${isExpanded ? 'expanded' : ''}`}>
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
                                </React.Fragment>
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

                    {/* Bottom Ad placement */}
                    <EzoicAd />
                </main>

                <aside className="article-sidebar">

                    

                    <VintageCoffeeTicket />

                    {/* Report Issue Button */}
                    <div style={{ marginTop: '30px', textAlign: 'center' }}>
                        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>Found solution wrong?</p>
                        <button
                            onClick={() => navigate('/report-solution', {
                                state: {
                                    questionId: data.questionId,
                                    title: data.title,
                                    platform: data.platform || 'LeetCode'
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
            </div >

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
