import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import VideoCard from './VideoCard';
import SEO from './SEO';
import { useSolved } from '../context/SolvedContext';

const CompanyPrepPage = ({ savedVideos, onToggleSave }) => {
    const { company } = useParams();
    const { isProblemSolved } = useSolved();

    const [planData, setPlanData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeLevel, setActiveLevel] = useState('0-1'); // Default level

    useEffect(() => {
        const fetchPlan = async () => {
            setLoading(true);
            try {
                const API_BASE = import.meta.env.VITE_API_URL || '';
                const res = await fetch(`${API_BASE}/api/company/${company}/plan`);
                if (res.ok) {
                    const data = await res.json();
                    setPlanData(data.plan);
                } else {
                    console.error("Plan not found");
                    setPlanData(null);
                }
            } catch (err) {
                console.error("Failed to fetch plan", err);
            } finally {
                setLoading(false);
            }
        };

        if (company) {
            fetchPlan();
        }
    }, [company]);

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading plan for {company}...</div>;
    }

    if (!planData) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Plan Not Found</h2>
                <p>We don't have a curated plan for <strong>{company}</strong> yet.</p>
                <Link to="/company-questions" style={{ color: 'var(--accent-orange)' }}>Back to Companies</Link>
            </div>
        );
    }

    const currentLevelData = planData[activeLevel];
    const totalProblems = currentLevelData?.problems?.length || 0;
    const solvedCount = currentLevelData?.problems?.filter(p => isProblemSolved(p)).length || 0;
    const progress = totalProblems > 0 ? (solvedCount / totalProblems) * 100 : 0;

    const formattedCompany = company.charAt(0).toUpperCase() + company.slice(1);

    return (
        <>
            <SEO title={`${formattedCompany} Interview Prep`} description={`Prepare for ${formattedCompany} with curated questions for ${activeLevel} years experience.`} path={`/company/${company}`} />

            <div className="company-prep-container" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯 {formattedCompany} Prep Hub</h1>
                    <p style={{ color: '#888' }}>Curated path to crack the interview.</p>
                </div>

                {/* Level Tabs */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                    {['0-1', '1-3', '3-5', '5+'].map(level => (
                        <button
                            key={level}
                            onClick={() => setActiveLevel(level)}
                            style={{
                                background: activeLevel === level ? 'var(--accent-orange)' : '#1a1a1a',
                                color: activeLevel === level ? 'white' : '#888',
                                border: `1px solid ${activeLevel === level ? 'var(--accent-orange)' : '#333'}`,
                                padding: '0.8rem 1.5rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {level} Years
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div style={{ animation: 'fadeIn 0.3s ease' }}>

                    {/* Progress Bar */}
                    <div style={{ background: '#1a1a1a', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #333' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>📊 Your Progress ({activeLevel} Years)</h3>
                            <span style={{ color: '#aaa' }}>{solvedCount} / {totalProblems} Solved</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-orange)', transition: 'width 0.5s ease' }}></div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                        {/* Left Column: Topics & CS Fundamentals */}
                        <div>
                            {/* Focus Topics */}
                            <div className="info-card" style={{ background: '#161616', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333', marginBottom: '1.5rem' }}>
                                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '1rem' }}>💡 Focus Topics</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {currentLevelData.topics?.map(t => (
                                        <span key={t} style={{ background: '#333', padding: '4px 10px', borderRadius: '20px', fontSize: '0.9rem' }}>{t}</span>
                                    ))}
                                </div>
                            </div>

                            {/* CS Fundamentals */}
                            {currentLevelData.cs_fundamentals && (
                                <div className="info-card" style={{ background: '#161616', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333', marginBottom: '1.5rem' }}>
                                    <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '1rem' }}>🎓 CS Fundamentals</h3>
                                    <ul style={{ paddingLeft: '1.2rem', color: '#ccc' }}>
                                        {currentLevelData.cs_fundamentals.map(cs => (
                                            <li key={cs} style={{ marginBottom: '0.5rem' }}>{cs}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* System Design */}
                            {currentLevelData.system_design && (
                                <div className="info-card" style={{ background: '#161616', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333', marginBottom: '1.5rem' }}>
                                    <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '1rem' }}>🏗️ System Design</h3>
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {currentLevelData.system_design.map(sd => (
                                            <li key={sd.title} style={{ marginBottom: '0.8rem', background: '#222', padding: '0.8rem', borderRadius: '8px' }}>
                                                <div style={{ fontWeight: 'bold', color: '#fff' }}>{sd.title}</div>
                                                <button style={{
                                                    marginTop: '0.5rem',
                                                    background: 'transparent',
                                                    border: '1px solid #555',
                                                    color: '#aaa',
                                                    padding: '4px 10px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer'
                                                }} onClick={() => alert("System Design resources coming soon!")}>
                                                    View Concept
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Right Column: DSA Questions */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <h3 style={{ marginBottom: '1rem' }}>💻 DSA Questions</h3>
                            <div className="problem-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {currentLevelData.problems && currentLevelData.problems.length > 0 ? (
                                    <table className="problem-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '50px' }}>Status</th>
                                                <th>Problem</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentLevelData.problems.map(problem => {
                                                const solved = isProblemSolved(problem);
                                                const isSaved = savedVideos.some(v => v.id === problem.id);
                                                return (
                                                    <tr key={problem.id} className={solved ? 'solved-row' : ''}>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <span
                                                                onClick={() => onToggleSave(problem)}
                                                                style={{ cursor: 'pointer', opacity: isSaved ? 1 : 0.3, fontSize: '1.2rem' }}
                                                            >
                                                                🔖
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <a href={`https://leetcode.com/problems/${problem.slug}`} target="_blank" rel="noreferrer" className="problem-title-link">
                                                                    {problem.id}. {problem.title}
                                                                </a>
                                                                <span className={`badge-difficulty ${problem.difficulty?.toLowerCase() || 'medium'}`} style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                                                                    {problem.difficulty}
                                                                </span>
                                                                {solved && <span>✅</span>}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <Link to={`/search/${problem.id}`} className="btn-solution" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>
                                                                ▶ Watch
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div style={{ padding: '2rem', textAlign: 'center', color: '#666', background: '#1a1a1a', borderRadius: '8px' }}>
                                        No DSA questions assigned for this specific level. Focus on System Design!
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default CompanyPrepPage;
