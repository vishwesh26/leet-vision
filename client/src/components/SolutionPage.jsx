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
        const fetchSolution = async () => {
            setLoading(true);
            setError('');
            try {
                const API_BASE = import.meta.env.VITE_API_URL || '';
                const response = await axios.get(`${API_BASE}/api/solution/${id}`);
                setData(response.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load solution. Please ensure your API key is configured.');
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
        <div style={{ background: '#080808', minHeight: '100vh', color: '#ddd', fontFamily: "'Outfit', sans-serif" }}>
            <SEO title={`${id}. ${data.title} - Full Explanation`} description={data.problemStatement} path={`/solution/${id}`} />

            {/* Main Container */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '3rem', padding: '4rem 2rem' }}>

                {/* Content Area */}
                <main>
                    <nav style={{ marginBottom: '2rem' }}>
                        <Link to="/top-100-leetcode" style={{ color: '#f57c00', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>‹</span> DSA Sheet
                        </Link>
                    </nav>

                    <header style={{ marginBottom: '3rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', margin: 0 }}>{data.title}</h1>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <IoMdFlash color="#f57c00" />
                                <span style={{ color: difficulty === 'Hard' ? '#ff4b2b' : difficulty === 'Easy' ? '#00c853' : '#f57c00', fontWeight: 700, fontSize: '0.9rem' }}>{difficulty}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                            <a href={`https://leetcode.com/problems/${id}/`} target="_blank" rel="noreferrer" style={{ background: '#1a1a1a', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '50px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', border: '1px solid #333' }}>
                                <IoMdLink /> Practice Here
                            </a>
                            {topics.map(t => (
                                <span key={t} style={{ background: 'rgba(255,255,255,0.05)', color: '#888', padding: '0.6rem 1.2rem', borderRadius: '50px', fontSize: '0.85rem', border: '1px solid #222' }}>
                                    #{t}
                                </span>
                            ))}
                        </div>
                    </header>

                    {/* Problem Statement Section */}
                    <section ref={sections.problem} id="problem-statement" style={{ marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '1.5rem', color: '#fff', borderLeft: '4px solid #f57c00', paddingLeft: '1rem', marginBottom: '1.5rem' }}>Problem Statement:</h2>
                        <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#bbb', marginBottom: '2rem' }}>{data.problemStatement}</div>

                        {data.analyticalOverview && (
                            <div style={{ background: '#111', padding: '2rem', borderRadius: '16px', border: '1px solid #222', marginBottom: '2rem' }}>
                                <h3 style={{ marginTop: 0, color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>Analytical Overview</h3>
                                <p style={{ margin: 0, lineHeight: 1.7, color: '#999' }}>{data.analyticalOverview}</p>
                            </div>
                        )}

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {data.examples?.map((ex, idx) => (
                                <div key={idx} style={{ background: '#111', borderRadius: '12px', border: '1px solid #222', padding: '1.5rem' }}>
                                    <div style={{ color: '#f57c00', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Example {idx + 1}</div>
                                    <pre style={{ margin: 0, color: '#ddd', fontSize: '0.95rem' }}>
                                        <strong>Input:</strong> {ex.input}<br />
                                        <strong>Output:</strong> {ex.output}<br />
                                        {ex.explanation && <><strong>Explanation:</strong> {ex.explanation}</>}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Complexity Table */}
                    {complexityTable.length > 0 && (
                        <section ref={sections.complexity} style={{ marginBottom: '4rem' }}>
                            <h2 style={{ fontSize: '1.5rem', color: '#fff', borderLeft: '4px solid #f57c00', paddingLeft: '1rem', marginBottom: '1.5rem' }}>Complexity Table</h2>
                            <div style={{ background: '#111', borderRadius: '16px', border: '1px solid #222', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ background: '#1a1a1a', color: '#fff' }}>
                                        <tr>
                                            <th style={{ padding: '1.2rem', fontSize: '0.9rem' }}>Method</th>
                                            <th style={{ padding: '1.2rem', fontSize: '0.9rem' }}>Time Complexity</th>
                                            <th style={{ padding: '1.2rem', fontSize: '0.9rem' }}>Space Complexity</th>
                                        </tr>
                                    </thead>
                                    <tbody style={{ color: '#aaa' }}>
                                        {complexityTable.map((row, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid #222' }}>
                                                <td style={{ padding: '1.2rem', color: '#f57c00', fontWeight: 600 }}>{row.method}</td>
                                                <td style={{ padding: '1.2rem', fontFamily: 'monospace' }}>{row.time}</td>
                                                <td style={{ padding: '1.2rem', fontFamily: 'monospace' }}>{row.space}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* Method Tree Visualization (CSS Sim) */}
                    <section ref={sections.method} style={{ marginBottom: '4rem', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ background: '#ff4b2b', color: '#fff', padding: '0.8rem 2rem', borderRadius: '50px', fontWeight: 700, border: '4px solid rgba(255,255,255,0.1)', marginBottom: '2rem' }}>Method</div>
                            <div style={{ display: 'flex', gap: '3rem', position: 'relative' }}>
                                {approaches.map((appr, idx) => (
                                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ width: '2px', height: '2rem', background: '#333', marginBottom: '0.5rem' }}></div>
                                        <div style={{ background: '#1a1a1a', color: '#fff', padding: '0.6rem 1.5rem', borderRadius: '10px', fontSize: '0.85rem', border: '1px solid #333' }}>{appr.name.split(' ')[0]}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Approaches Section */}
                    <section ref={sections.approaches} id="approaches">
                        <h2 style={{ fontSize: '1.5rem', color: '#fff', borderLeft: '4px solid #f57c00', paddingLeft: '1rem', marginBottom: '2rem' }}>Approach Breakdown:</h2>
                        {approaches.map((appr, idx) => {
                            const currentLang = activeLangs[idx] || 'python';
                            return (
                                <article key={idx} style={{ background: '#111', borderRadius: '24px', border: '1px solid #222', padding: '2.5rem', marginBottom: '3rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                        <div style={{ background: '#f57c00', color: '#000', padding: '0.4rem 1rem', borderRadius: '6px', fontWeight: 800, fontSize: '0.8rem' }}>{idx + 1}</div>
                                        <h3 style={{ margin: 0, color: '#fff', fontSize: '1.4rem' }}>{appr.name}</h3>
                                    </div>

                                    <p style={{ color: '#aaa', lineHeight: 1.7, marginBottom: '2rem' }}>{appr.concept}</p>

                                    <div style={{ marginBottom: '2rem' }}>
                                        <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '1rem' }}>Algorithm Steps:</h4>
                                        <ol style={{ color: '#999', lineHeight: 1.8, paddingLeft: '1.2rem' }}>
                                            {(appr.steps || appr.algorithm)?.map((step, sIdx) => <li key={sIdx} style={{ marginBottom: '0.5rem' }}>{step}</li>)}
                                        </ol>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                                        <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222', textAlign: 'center' }}>
                                            <div style={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Time Complexity</div>
                                            <div style={{ color: '#f57c00', fontSize: '1.2rem', fontWeight: 700, fontFamily: 'monospace' }}>{appr.complexity?.time}</div>
                                        </div>
                                        <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222', textAlign: 'center' }}>
                                            <div style={{ color: '#666', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Space Complexity</div>
                                            <div style={{ color: '#f57c00', fontSize: '1.2rem', fontWeight: 700, fontFamily: 'monospace' }}>{appr.complexity?.space}</div>
                                        </div>
                                    </div>

                                    {/* Code Tabs */}
                                    <div style={{ background: '#000', borderRadius: '16px', border: '1px solid #333', overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', background: '#0f0f0f', padding: '0 1rem', borderBottom: '1px solid #252525', overflowX: 'auto' }}>
                                            {['cpp', 'java', 'python', 'javascript'].map(l => (
                                                <button key={l} onClick={() => handleLangChange(idx, l)} style={{ background: 'transparent', border: 'none', padding: '1rem 1.5rem', color: currentLang === l ? '#fff' : '#555', cursor: 'pointer', borderBottom: currentLang === l ? '2px solid #f57c00' : '2px solid transparent', textTransform: 'capitalize', fontWeight: currentLang === l ? 700 : 400 }}>{l === 'cpp' ? 'C++' : l}</button>
                                            ))}
                                        </div>
                                        <SyntaxHighlighter language={currentLang} style={vscDarkPlus} customStyle={{ margin: 0, padding: '2rem', fontSize: '0.9rem', lineHeight: 1.6, background: 'transparent' }} showLineNumbers>{appr.codes?.[currentLang] || '// Loading code...'}</SyntaxHighlighter>
                                    </div>
                                </article>
                            )
                        })}
                    </section>

                    {/* Video Section Toggle */}
                    <div ref={sections.video} style={{ marginTop: '4rem', borderTop: '1px solid #222', paddingTop: '3rem' }}>
                        <button onClick={() => setVideoVisible(!videoVisible)} style={{ width: '100%', padding: '1.5rem', background: '#111', border: '1px solid #333', borderRadius: '12px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><IoMdPlay color="#f57c00" /> <span style={{ fontWeight: 700 }}>Watch Detailed Video Solution</span></div>
                            {videoVisible ? <IoIosArrowUp /> : <IoIosArrowDown />}
                        </button>
                        {videoVisible && data.video && (
                            <div style={{ marginTop: '1.5rem', borderRadius: '16px', overflow: 'hidden', aspectVideo: '16/9', background: '#000', border: '1px solid #333' }}>
                                <iframe width="100%" height="500" src={`https://www.youtube.com/embed/${data.video.id}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                            </div>
                        )}
                    </div>
                </main>

                {/* Sidebar Navigation */}
                <aside style={{ position: 'sticky', top: '4rem', height: 'fit-content' }}>
                    <div style={{ paddingLeft: '2rem', borderLeft: '1px solid #222' }}>
                        <h4 style={{ color: '#fff', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem' }}>On this page</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <li onClick={() => scrollToSection(sections.video)} style={{ cursor: 'pointer', color: '#888', fontSize: '0.9rem', transition: '0.3s' }}>Video Tutorial</li>
                            <li onClick={() => scrollToSection(sections.problem)} style={{ cursor: 'pointer', color: '#888', fontSize: '0.9rem' }}>Problem Statement</li>
                            <li onClick={() => scrollToSection(sections.complexity)} style={{ cursor: 'pointer', color: '#888', fontSize: '0.9rem' }}>Complexity Table</li>
                            <li onClick={() => { scrollToSection(sections.method) }} style={{ cursor: 'pointer', color: '#888', fontSize: '0.9rem' }}>Method Breakdown</li>
                            {approaches.map((a, i) => (
                                <li key={i} onClick={() => scrollToSection(sections.approaches)} style={{ cursor: 'pointer', color: '#666', fontSize: '0.85rem', paddingLeft: '1rem' }}>{i + 1}. {a.name.split(' ')[0]}</li>
                            ))}
                        </ul>
                    </div>

                    <div style={{ marginTop: '4rem', paddingLeft: '2rem' }}>
                        <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #000 100%)', padding: '1.5rem', borderRadius: '16px', border: '1px solid #333' }}>
                            <IoMdTrophy size={30} color="#f57c00" style={{ marginBottom: '1rem' }} />
                            <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Master Problem Solving</div>
                            <p style={{ color: '#666', fontSize: '0.8rem', lineHeight: 1.5, margin: 0 }}>Practice makes perfect. Try to solve this on LeetCode without hints.</p>
                        </div>
                    </div>
                </aside>
            </div>

            <style>{`
                main ul li::marker { color: #f57c00; }
                aside li:hover { color: #f57c00 !important; }
            `}</style>
        </div>
    );
};

export default SolutionPage;
