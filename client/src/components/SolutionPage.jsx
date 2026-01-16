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

    // Track active language for each approach independently
    const [activeLangs, setActiveLangs] = useState({});

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
                if (err.response && err.response.status === 503) {
                    setError('Service Unavailable: AI features require configuration (API Key Missing).');
                } else {
                    setError('Failed to generate solution. AI service might be busy.');
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchSolution();
    }, [id]);

    const handleLangChange = (approachIndex, lang) => {
        setActiveLangs(prev => ({
            ...prev,
            [approachIndex]: lang
        }));
    };

    const LANG_OPTIONS = [
        { key: 'cpp', label: 'C++' },
        { key: 'java', label: 'Java' },
        { key: 'python', label: 'Python' },
        { key: 'javascript', label: 'JavaScript' }
    ];

    if (loading) return (
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff', fontFamily: 'Inter, sans-serif' }}>
            <span style={{ fontSize: '3rem', animation: 'pulse 1.5s infinite', display: 'block', marginBottom: '1rem' }}>⚡</span>
            <h2 style={{ color: '#aaa', fontWeight: 'normal' }}>Generating Optimized Solutions...</h2>
            <p style={{ color: '#666' }}>Analyzing complexities and writing code (2-4s)</p>
            <style>{`@keyframes pulse { 0% { opacity: 0.3; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.1); } 100% { opacity: 0.3; transform: scale(0.9); } }`}</style>
        </div>
    );

    if (error) return (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#ff6b6b', fontFamily: 'Inter, sans-serif' }}>
            <h2>⚠️ Error</h2>
            <p>{error}</p>
            <Link to={`/search/${id}`} style={{ color: '#fff', textDecoration: 'underline', marginTop: '1rem', display: 'inline-block' }}>Go Back</Link>
        </div>
    );

    // Support legacy/fallback data structure if old cache hits
    // Normalize data: If 'solutions' exists but 'approaches' doesn't, map it.
    let approaches = data.approaches || [];
    if (approaches.length === 0 && data.solutions) {
        // Legacy mapping
        if (data.solutions.basic) approaches.push({ name: 'Basic Approach', ...data.solutions.basic, codes: { python: data.solutions.basic.code } });
        if (data.solutions.optimized) approaches.push({ name: 'Optimized Approach', ...data.solutions.optimized, codes: { python: data.solutions.optimized.code } });
        if (data.solutions.best) approaches.push({ name: 'Best Approach', ...data.solutions.best, codes: { python: data.solutions.best.code } });
    }

    if (!data) return null;

    return (
        <div style={{ background: '#111', minHeight: '100vh', color: '#ddd', fontFamily: 'Inter, sans-serif' }}>
            <SEO title={`Solution ${id}`} description={`LeetCode Solution for ${id}`} path={`/solution/${id}`} />

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
                <Link to={`/search/${id}`} style={{ color: '#888', textDecoration: 'none', marginBottom: '1.5rem', display: 'inline-block', fontSize: '0.9rem' }}>
                    ← Back to Video
                </Link>

                {/* Header */}
                <header style={{ marginBottom: '3rem', borderBottom: '1px solid #333', paddingBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                        {id}. {data.title || "Problem Solution"}
                    </h1>
                    {data.problemStatement && (
                        <p style={{ color: '#aaa', lineHeight: 1.6, maxWidth: '800px' }}>
                            {data.problemStatement}
                        </p>
                    )}
                </header>

                {/* Approaches */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {approaches.length === 0 ? (
                        <div style={{ color: '#666', fontStyle: 'italic' }}>
                            No detailed approaches found. Try attempting to regenerate or check connection.
                            <pre style={{ fontSize: '0.7rem', marginTop: '1rem' }}>{JSON.stringify(data, null, 2)}</pre>
                        </div>
                    ) : approaches.map((approach, idx) => {
                        const currentLang = activeLangs[idx] || 'python'; // Default to python

                        return (
                            <div key={idx} className="approach-section" style={{ borderLeft: '3px solid #f57c00', paddingLeft: '1.5rem' }}>
                                <h2 style={{ color: '#f57c00', marginTop: 0, fontSize: '1.5rem' }}>{approach.name || `Approach ${idx + 1}`}</h2>

                                {/* Algorithm */}
                                <div style={{ margin: '1.5rem 0' }}>
                                    <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>Algorithm</h3>
                                    <ul style={{ paddingLeft: '1.5rem', color: '#ccc', lineHeight: '1.7' }}>
                                        {Array.isArray(approach.algorithm) ? approach.algorithm.map((step, sIdx) => (
                                            <li key={sIdx} style={{ marginBottom: '0.5rem' }}>{step}</li>
                                        )) : <p>{approach.algorithm || approach.explanation}</p>}
                                    </ul>
                                </div>

                                {/* Code Section */}
                                <div style={{ background: '#1e1e1e', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333' }}>
                                    {/* Tabs */}
                                    <div style={{ display: 'flex', borderBottom: '1px solid #333', background: '#252525', overflowX: 'auto' }}>
                                        {LANG_OPTIONS.map(opt => (
                                            <button
                                                key={opt.key}
                                                onClick={() => handleLangChange(idx, opt.key)}
                                                style={{
                                                    background: currentLang === opt.key ? '#1e1e1e' : 'transparent',
                                                    color: currentLang === opt.key ? '#fff' : '#888',
                                                    border: 'none',
                                                    padding: '0.8rem 1.5rem',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                    fontWeight: currentLang === opt.key ? 600 : 400,
                                                    borderTop: currentLang === opt.key ? '2px solid #f57c00' : '2px solid transparent',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Editor */}
                                    <div style={{ position: 'relative' }}>
                                        <SyntaxHighlighter
                                            language={currentLang === 'cpp' ? 'cpp' : currentLang}
                                            style={vscDarkPlus}
                                            customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.9rem', lineHeight: 1.5, background: '#1e1e1e' }}
                                            showLineNumbers={true}
                                        >
                                            {approach.codes ? (approach.codes[currentLang] || `// Code not available in ${currentLang}`) : (approach.code || "// Code not available")}
                                        </SyntaxHighlighter>
                                    </div>
                                </div>

                                {/* Complexity */}
                                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                    <div style={{ background: '#222', padding: '1rem', borderRadius: '8px', flex: 1, border: '1px solid #333', minWidth: '200px' }}>
                                        <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Time Complexity</div>
                                        <div style={{ color: '#fff', fontSize: '1.1rem', fontFamily: 'monospace' }}>
                                            {(approach.complexity && approach.complexity.time) ? approach.complexity.time : (approach.time || "?")}
                                        </div>
                                    </div>
                                    <div style={{ background: '#222', padding: '1rem', borderRadius: '8px', flex: 1, border: '1px solid #333', minWidth: '200px' }}>
                                        <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '0.3rem' }}>Space Complexity</div>
                                        <div style={{ color: '#fff', fontSize: '1.1rem', fontFamily: 'monospace' }}>
                                            {(approach.complexity && approach.complexity.space) ? approach.complexity.space : (approach.space || "?")}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SolutionPage;
