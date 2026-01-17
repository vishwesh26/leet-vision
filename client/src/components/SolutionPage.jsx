import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import SEO from './SEO';

const SolutionPage = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State to track expanded sections. 
    // Keys: 'examples', 'approach-0', 'approach-1', etc.
    const [expandedSections, setExpandedSections] = useState({});

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

                // Initialize expanded state:
                // Collapsed by default (as per user request/image), except maybe nothing? 
                // Or maybe just let user open them? The image showed all collapsed.
                // We'll start with all collapsed.
                setExpandedSections({});

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

    const toggleSection = (sectionKey) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }));
    };

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
        if (data.solutions.basic) approaches.push({ name: 'Brute Force Approach', ...data.solutions.basic, codes: { python: data.solutions.basic.code } });
        if (data.solutions.optimized) approaches.push({ name: 'Optimized Approach', ...data.solutions.optimized, codes: { python: data.solutions.optimized.code } });
        if (data.solutions.best) approaches.push({ name: 'Best Approach', ...data.solutions.best, codes: { python: data.solutions.best.code } });
    }

    if (!data) return null;

    return (
        <div style={{ background: '#111', minHeight: '100vh', color: '#ddd', fontFamily: 'Inter, sans-serif', paddingBottom: '4rem' }}>
            <SEO title={`Solution ${id}`} description={`LeetCode Solution for ${id}`} path={`/solution/${id}`} />

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem' }}>
                <Link to="/top-100-leetcode" style={{ color: '#888', textDecoration: 'none', marginBottom: '1.5rem', display: 'inline-block', fontSize: '0.9rem' }}>
                    ← Back to Questions
                </Link>

                {/* Header */}
                <header style={{ marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                        {id}. {data.title || "Problem Solution"}
                    </h1>
                    {data.problemStatement && (
                        <p style={{ color: '#aaa', lineHeight: 1.6, maxWidth: '90%' }}>
                            {data.problemStatement}
                        </p>
                    )}
                </header>

                {/* Examples Accordion */}
                {data.examples && data.examples.length > 0 && (
                    <div className="accordion-item" style={{ marginBottom: '1rem', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
                        <button
                            onClick={() => toggleSection('examples')}
                            style={{
                                width: '100%',
                                padding: '1rem 1.5rem',
                                background: '#1a1a1a',
                                border: 'none',
                                color: '#fff',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            <span>Examples</span>
                            {expandedSections['examples'] ? <IoIosArrowUp /> : <IoIosArrowDown />}
                        </button>

                        {expandedSections['examples'] && (
                            <div style={{ padding: '1.5rem', background: '#111', borderTop: '1px solid #333' }}>
                                {data.examples.map((ex, idx) => (
                                    <div key={idx} style={{ marginBottom: '1rem' }}>
                                        <div style={{ color: '#fff', marginBottom: '0.3rem', fontWeight: 600 }}>Example {idx + 1}:</div>
                                        <div style={{ background: '#222', padding: '0.8rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.9rem', color: '#ccc' }}>
                                            <div><span style={{ color: '#888' }}>Input:</span> {ex.input}</div>
                                            <div><span style={{ color: '#888' }}>Output:</span> {ex.output}</div>
                                            {ex.explanation && <div><span style={{ color: '#888' }}>Explanation:</span> {ex.explanation}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Approaches Accordions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {approaches.length === 0 ? (
                        <div style={{ color: '#666', fontStyle: 'italic', padding: '2rem', textAlign: 'center', border: '1px solid #333', borderRadius: '8px' }}>
                            No detailed approaches found. Try attempting to regenerate or check connection.
                        </div>
                    ) : approaches.map((approach, idx) => {
                        const sectionKey = `approach-${idx}`;
                        const isExpanded = expandedSections[sectionKey];
                        const currentLang = activeLangs[idx] || 'python';

                        return (
                            <div key={idx} className="accordion-item" style={{ border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
                                <button
                                    onClick={() => toggleSection(sectionKey)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1.5rem',
                                        background: '#1a1a1a',
                                        border: 'none',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    <span style={{ fontSize: '1.1rem', color: '#fff' }}>
                                        {approach.name || `Approach ${idx + 1}`}
                                    </span>
                                    {isExpanded ? <IoIosArrowUp color="#ccc" /> : <IoIosArrowDown color="#ccc" />}
                                </button>

                                {isExpanded && (
                                    <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', background: '#111', borderTop: '1px solid #333' }}>
                                        {/* Algorithm */}
                                        <div style={{ margin: '1.5rem 0' }}>
                                            <h3 style={{ fontSize: '1rem', color: '#888', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Algorithm</h3>
                                            <ul style={{ paddingLeft: '1.5rem', color: '#ccc', lineHeight: '1.7' }}>
                                                {Array.isArray(approach.algorithm) ? approach.algorithm.map((step, sIdx) => (
                                                    <li key={sIdx} style={{ marginBottom: '0.4rem' }}>{step}</li>
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
                                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                            <div style={{ background: '#1a1a1a', padding: '0.8rem 1.2rem', borderRadius: '6px', border: '1px solid #333', flex: 1, minWidth: '150px' }}>
                                                <div style={{ color: '#666', fontSize: '0.8rem', marginBottom: '0.2rem' }}>Time Complexity</div>
                                                <div style={{ color: '#ddd', fontSize: '1rem', fontFamily: 'monospace' }}>
                                                    {(approach.complexity && approach.complexity.time) ? approach.complexity.time : (approach.time || "?")}
                                                </div>
                                            </div>
                                            <div style={{ background: '#1a1a1a', padding: '0.8rem 1.2rem', borderRadius: '6px', border: '1px solid #333', flex: 1, minWidth: '150px' }}>
                                                <div style={{ color: '#666', fontSize: '0.8rem', marginBottom: '0.2rem' }}>Space Complexity</div>
                                                <div style={{ color: '#ddd', fontSize: '1rem', fontFamily: 'monospace' }}>
                                                    {(approach.complexity && approach.complexity.space) ? approach.complexity.space : (approach.space || "?")}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SolutionPage;
