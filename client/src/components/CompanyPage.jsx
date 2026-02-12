import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import SEO from './SEO';
import { useSolved } from '../context/SolvedContext';
import { useAuth } from '../context/AuthContext';

const companies = [
    { id: 'google', name: 'Google' },
    { id: 'microsoft', name: 'Microsoft' },
    { id: 'amazon', name: 'Amazon' },
    { id: 'meta', name: 'Meta' },
    { id: 'apple', name: 'Apple' }
    // Add more as needed
];

const CompanyPage = () => {
    const { user } = useAuth();
    const hasFullAccess = user && user.subscriptionExpiry && new Date(user.subscriptionExpiry) > new Date();

    const [selectedCompany, setSelectedCompany] = useState(companies[0]);
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('All');

    // Context for solved status
    const { isProblemSolved } = useSolved();

    const fetchProblems = async (companyId) => {
        setLoading(true);
        setError('');
        setProblems([]);
        try {
            const API_BASE = import.meta.env.VITE_API_URL || '';
            const response = await axios.get(`${API_BASE}/api/company/${companyId}`);
            setProblems(response.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load company data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedCompany) {
            fetchProblems(selectedCompany.id);
        }
    }, [selectedCompany]);

    const handleCompanyChange = (e) => {
        const comp = companies.find(c => c.id === e.target.value);
        if (comp) setSelectedCompany(comp);
    };

    // Separate into Asked and Similar
    const askedProblems = problems.filter(p => p.companyStatus.type === 'asked' && (filterDifficulty === 'All' || p.difficulty === filterDifficulty));
    const similarProblems = problems.filter(p => p.companyStatus.type === 'similar' && (filterDifficulty === 'All' || p.difficulty === filterDifficulty));

    const ProblemCard = ({ problem, index }) => {
        const isAsked = problem.companyStatus.type === 'asked';
        const solved = isProblemSolved(problem);
        const locked = !hasFullAccess && index >= 4;

        return (
            <div key={problem.id} style={{
                background: '#1a1a1a',
                border: `1px solid ${solved ? '#00b8a3' : '#333'}`,
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative',
                opacity: locked ? 0.6 : 1,
                cursor: locked ? 'not-allowed' : 'default'
            }}>
                {locked && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(4px)',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '12px',
                        padding: '1rem',
                        textAlign: 'center'
                    }}>
                        <span style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔒</span>
                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'white' }}>Premium Only</div>
                        <Link to="/pricing" style={{
                            background: 'var(--accent-orange)',
                            color: 'white',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            textDecoration: 'none',
                            fontWeight: 'bold'
                        }}>Upgrade to View</Link>
                    </div>
                )}

                <div style={{ filter: locked ? 'blur(2px)' : 'none', display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
                    {/* Badge */}
                    <div style={{
                        alignSelf: 'flex-start',
                        display: 'inline-block',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        background: isAsked ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 193, 7, 0.15)',
                        color: isAsked ? '#4caf50' : '#ffc107',
                        border: `1px solid ${isAsked ? '#4caf50' : '#ffc107'}`
                    }}>
                        {isAsked ? `Asked by ${selectedCompany.name}` : `Similar to ${selectedCompany.name}`}
                    </div>

                    {/* Title */}
                    <div>
                        <h3 style={{ fontSize: '1.2rem', margin: 0, lineHeight: 1.4 }}>
                            <span style={{ color: '#888', marginRight: '0.5rem' }}>#{problem.id}.</span>
                            {problem.title}
                        </h3>
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{
                            color: problem.difficulty === 'Easy' ? '#00b8a3' : problem.difficulty === 'Medium' ? '#ffc01e' : '#ff375f',
                            background: problem.difficulty === 'Easy' ? '#00b8a322' : problem.difficulty === 'Medium' ? '#ffc01e22' : '#ff375f22',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem'
                        }}>
                            {problem.difficulty}
                        </span>
                        {problem.topics.slice(0, 2).map(t => (
                            <span key={t} style={{ background: '#333', color: '#aaa', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                                {t}
                            </span>
                        ))}
                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingTop: '1rem', borderTop: '1px solid #2a2a2a' }}>
                        <div style={{ display: 'flex', gap: '0.8rem' }}>
                            <a
                                href={`https://leetcode.com/problems/${problem.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    flex: 1,
                                    textAlign: 'center',
                                    background: '#333',
                                    color: 'white',
                                    padding: '0.6rem',
                                    borderRadius: '6px',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem'
                                }}
                            >
                                LeetCode ↗
                            </a>
                            <Link
                                to={`/search/${problem.id}`}
                                style={{
                                    flex: 1,
                                    textAlign: 'center',
                                    background: '#333',
                                    color: 'white',
                                    padding: '0.6rem',
                                    borderRadius: '6px',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem'
                                }}
                            >
                                Video ▶
                            </Link>
                        </div>
                        <Link
                            to={`/solution/${problem.id}`}
                            style={{
                                width: '100%',
                                textAlign: 'center',
                                background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
                                color: 'white',
                                padding: '0.6rem',
                                borderRadius: '6px',
                                border: 'none',
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                textDecoration: 'none',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                                boxSizing: 'border-box',
                                display: 'block'
                            }}
                        >
                            Optimized Solution ⚡
                        </Link>
                    </div>
                </div>

                {solved && <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '1.2rem' }} title="Solved">✅</div>}
            </div>
        );
    };

    return (
        <>
            <SEO
                title={`${selectedCompany.name} Interview Questions - LeetVision`}
                description={`Top LeetCode questions asked in ${selectedCompany.name} interviews.`}
                path="/company-questions"
            />

            <div style={{ padding: '2rem 5%', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Company Wise Questions</h1>
                    <p style={{ color: '#888' }}>
                        See which LeetCode questions are <span style={{ color: '#4caf50' }}>really asked</span> by {selectedCompany.name}.
                    </p>
                </div>

                {/* Disclaimer */}
                <div style={{
                    background: 'rgba(53, 115, 255, 0.1)',
                    border: '1px solid #3573fd',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '3rem',
                    textAlign: 'center',
                    color: '#a3c2ff',
                    fontSize: '0.9rem'
                }}>
                    ℹ️ These questions are based on community-reported interview experiences and LeetCode company styles.
                    They are not a complete list of all questions asked by the company.
                </div>

                {/* Controls */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#161616',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #333',
                    marginBottom: '2rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontWeight: 'bold', color: '#ccc' }}>Select Company:</span>
                        <select
                            value={selectedCompany.id}
                            onChange={handleCompanyChange}
                            style={{
                                background: '#222',
                                color: 'white',
                                border: '1px solid #444',
                                padding: '0.6rem 1rem',
                                borderRadius: '6px',
                                fontSize: '1rem',
                                cursor: 'pointer'
                            }}
                        >
                            {companies.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ color: '#888' }}>Filter:</span>
                        {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                            <button
                                key={d}
                                onClick={() => setFilterDifficulty(d)}
                                style={{
                                    background: filterDifficulty === d ? 'var(--accent-orange)' : 'transparent',
                                    color: filterDifficulty === d ? 'white' : '#888',
                                    border: filterDifficulty === d ? 'none' : '1px solid #444',
                                    padding: '0.4rem 0.8rem',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                {loading && <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>Loading questions...</div>}

                {error && <div style={{ textAlign: 'center', color: '#ff4444', padding: '2rem' }}>{error}</div>}

                {!loading && !error && (
                    <>
                        {/* Section 1: Asked by Company */}
                        <div style={{ marginBottom: '4rem' }}>
                            <h2 style={{
                                fontSize: '1.8rem',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                borderBottom: '1px solid #333',
                                paddingBottom: '1rem'
                            }}>
                                <span style={{ color: '#4caf50' }}>●</span> Asked by {selectedCompany.name}
                                <span style={{ fontSize: '1rem', color: '#666', fontWeight: 'normal' }}>
                                    (Community Reported)
                                </span>
                            </h2>

                            {askedProblems.length === 0 ? (
                                <div style={{ color: '#666', fontStyle: 'italic' }}>No questions found matching criteria.</div>
                            ) : (
                                <div className="company-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                                    {askedProblems.map((p, i) => <ProblemCard key={p.id} problem={p} index={i} />)}
                                </div>
                            )}
                        </div>

                        {/* Section 2: Similar Questions */}
                        <div>
                            <h2 style={{
                                fontSize: '1.8rem',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                borderBottom: '1px solid #333',
                                paddingBottom: '1rem'
                            }}>
                                <span style={{ color: '#ffc107' }}>●</span> Similar to {selectedCompany.name} Interviews
                                <span style={{ fontSize: '1rem', color: '#666', fontWeight: 'normal' }}>
                                    (Based on Patterns)
                                </span>
                            </h2>

                            {similarProblems.length === 0 ? (
                                <div style={{ color: '#666', fontStyle: 'italic' }}>No questions found matching criteria.</div>
                            ) : (
                                <div className="company-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                                    {similarProblems.map((p, i) => <ProblemCard key={p.id} problem={p} index={i} />)}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default CompanyPage;
