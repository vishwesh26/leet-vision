import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import SEO from './SEO';

const SolutionPage = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('optimized'); // Default to optimized

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
                setError('Failed to generate solution. AI service might be busy.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchSolution();
    }, [id]);

    const tabs = [
        { key: 'basic', label: 'Basic' },
        { key: 'optimized', label: 'Optimized' },
        { key: 'best', label: 'Best' }
    ];

    return (
        <>
            <SEO title={`Solution - ${id}`} description={`AI generated solution for LeetCode ${id}`} path={`/solution/${id}`} />

            <div className="solution-page-container" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
                <Link to={`/search/${id}`} className="back-link" style={{ color: '#888', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
                    ← Back to Video
                </Link>

                <h1 style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>
                    Code Solution <span style={{ color: '#f57c00' }}>#{id}</span>
                </h1>

                {loading && (
                    <div className="loading-skeleton">
                        <div style={{ padding: '3rem', textAlign: 'center', background: '#1a1a1a', borderRadius: '12px' }}>
                            <span style={{ fontSize: '2rem', animation: 'pulse 1.5s infinite' }}>⚡</span>
                            <p style={{ marginTop: '1rem', color: '#888' }}>Generating AI Solution (2-3s)...</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="error-box" style={{ padding: '2rem', background: '#331111', color: '#ff4444', borderRadius: '12px', textAlign: 'center' }}>
                        {error}
                        <button onClick={() => window.location.reload()} style={{ display: 'block', margin: '1rem auto', padding: '0.5rem 1rem', background: '#444', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '4px' }}>Retry</button>
                    </div>
                )}

                {data && data.solutions && (
                    <div className="solution-content">
                        {/* Tabs */}
                        <div className="tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #333' }}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: '0.8rem 1.5rem',
                                        color: activeTab === tab.key ? '#f57c00' : '#888',
                                        borderBottom: activeTab === tab.key ? '2px solid #f57c00' : '2px solid transparent',
                                        cursor: 'pointer',
                                        fontSize: '1.1rem',
                                        fontWeight: activeTab === tab.key ? 'bold' : 'normal'
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="tab-content" style={{ background: '#1a1a1a', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
                            <h3 style={{ marginTop: 0, color: '#ddd' }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Approach</h3>

                            <p style={{ color: '#ccc', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                                {data.solutions[activeTab].explanation}
                            </p>

                            <div className="complexity-badges" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <span style={{ background: '#222', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.9rem', color: '#888' }}>
                                    ⏱️ Time: <span style={{ color: '#fff' }}>{data.solutions[activeTab].time}</span>
                                </span>
                                <span style={{ background: '#222', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.9rem', color: '#888' }}>
                                    💾 Space: <span style={{ color: '#fff' }}>{data.solutions[activeTab].space}</span>
                                </span>
                            </div>

                            <div className="code-block-wrapper" style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
                                <SyntaxHighlighter language="python" style={vscDarkPlus} showLineNumbers={true} customStyle={{ margin: 0, padding: '1.5rem' }}>
                                    {data.solutions[activeTab].code}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default SolutionPage;
