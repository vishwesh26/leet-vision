import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { basicToAdvanceModules } from '../data/basicToAdvance';
import { FaExternalLinkAlt, FaBrain, FaChevronDown, FaChevronUp, FaLock, FaCheckCircle, FaCircle, FaPlay } from 'react-icons/fa';
import { useSolved } from '../context/SolvedContext';
import SkeletonLoader from './SkeletonLoader';

const BasicToAdvancePage = () => {
    const { user } = useAuth();
    const { isProblemSolved } = useSolved();
    const isGuest = !user; 

    const [expandedUnits, setExpandedUnits] = useState({});
    const [allProblems, setAllProblems] = useState({});
    const [loading, setLoading] = useState(true);

    const API_BASE = import.meta.env.VITE_API_URL || '';

    // Fetch all problems on mount
    useEffect(() => {
        const fetchAllCurated = async () => {
            try {
                const allIds = basicToAdvanceModules.flatMap(m => m.ids);
                const response = await axios.post(`${API_BASE}/api/universe/curated`, {
                    ids: allIds
                });
                
                const fetchedMap = {};
                response.data.problems.forEach(p => {
                    fetchedMap[p.questionId] = p;
                });
                setAllProblems(fetchedMap);
            } catch (err) {
                console.error(`Failed to fetch Basic to Advance problems:`, err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllCurated();
        // Expand the first unit by default
        setExpandedUnits({ 0: true });
    }, [API_BASE]);

    const handleUnitToggle = (unitIndex) => {
        setExpandedUnits(prev => ({ ...prev, [unitIndex]: !prev[unitIndex] }));
    };

    const getDifficultyColor = (diff) => {
        if (diff === 'Easy') return '#00b8a3';
        if (diff === 'Medium') return '#ffc01e';
        if (diff === 'Hard') return '#ff375f';
        return '#888';
    };

    // Calculate progress across all loaded nodes
    const { totalMastered, totalQuestions } = useMemo(() => {
        if (Object.keys(allProblems).length === 0) return { totalMastered: 0, totalQuestions: 0 };
        
        let qs = basicToAdvanceModules.reduce((acc, curr) => acc + curr.ids.length, 0);
        let m = 0;
        
        basicToAdvanceModules.forEach(mod => {
            mod.ids.forEach(id => {
                const prob = allProblems[String(id)];
                if (prob && isProblemSolved(prob)) {
                    m++;
                }
            });
        });
        
        return { totalMastered: m, totalQuestions: qs };
    }, [allProblems, isProblemSolved]);

    const progressPercent = totalQuestions > 0 ? Math.round((totalMastered / totalQuestions) * 100) : 0;

    return (
        <div style={{ paddingBottom: '4rem' }}>
            {/* HERO SECTION */}
            <div className="roadmap-hero">
                <h1 className="super-title glow-text" style={{ fontSize: '3.5rem', margin: '0', letterSpacing: '-1px' }}>
                    The <span style={{ color: '#ffa116' }}>Mastery</span> Path
                </h1>
                <p className="universal-subtitle" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '15px auto 30px auto', color: '#aaa' }}>
                    Follow our hand-crafted curriculum designed to take you from coding fundamentals to advanced graphs and dynamic programming.
                </p>
                
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ccc' }}>YOUR PROGRESS</div>
                    <div style={{ width: '150px', height: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, #f57c00, #ffb74d)', transition: 'width 0.5s ease' }}></div>
                    </div>
                    <div style={{ color: '#ffa116', fontWeight: 800 }}>{totalMastered} / {totalQuestions}</div>
                </div>
            </div>

            {/* TIMELINE SECTION */}
            <div className="timeline-container">
                {basicToAdvanceModules.map((module, idx) => {
                    const isExpanded = expandedUnits[idx];
                    
                    const problems = module.ids.map(id => allProblems[String(id)]).filter(Boolean);

                    // Check master count for this unit specifically
                    let unitSolved = 0;
                    problems.forEach(prob => {
                        if (isProblemSolved(prob)) unitSolved++;
                    });
                    
                    const isFullyMastered = unitSolved === module.ids.length && module.ids.length > 0;

                    return (
                        <div key={idx} className={`timeline-node-wrapper ${isExpanded ? 'expanded' : ''}`}>
                            <div className="timeline-icon-container">
                                <div className="timeline-icon-glow">
                                    {module.icon}
                                </div>
                            </div>

                            <div className="timeline-content">
                                <div className={`roadmap-module-card ${isExpanded ? 'expanded' : ''}`}>
                                    <div 
                                        className="roadmap-module-header"
                                        onClick={() => handleUnitToggle(idx)}
                                    >
                                        <div>
                                            <h3>{module.unit.replace(/^UNIT \d+:\s*/, '')}</h3>
                                            <div className="roadmap-module-subtitle">
                                                Unit {idx + 1} &bull; {module.ids.length} Questions &bull; <span style={{ color: isFullyMastered ? '#00b8a3' : '#ffa116' }}>{unitSolved} Completed</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            {isExpanded ? <FaChevronUp color="#888" size={18} /> : <FaChevronDown color="#888" size={18} />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="roadmap-problems-container">
                                            {loading ? (
                                                <div style={{ padding: '15px' }}>
                                                    <SkeletonLoader 
                                                        variant="row" 
                                                        count={5} 
                                                        itemStyle={{ height: '55px', marginBottom: '8px', borderRadius: '12px', background: '#111' }} 
                                                    />
                                                </div>
                                            ) : problems.length > 0 ? (
                                                problems.map((prob) => {
                                                    const solvedState = isProblemSolved(prob);
                                                    
                                                    return (
                                                        <div key={prob._id} className="roadmap-problem-pill">
                                                            <div className="pill-status">
                                                                {solvedState ? (
                                                                    <FaCheckCircle color="#00b8a3" title="Solved" size={20} style={{ filter: 'drop-shadow(0 0 5px rgba(0,184,163,0.4))' }} />
                                                                ) : (
                                                                    <FaCircle color="rgba(255,255,255,0.08)" title="Unsolved" size={20} />
                                                                )}
                                                            </div>
                                                            <div className="pill-info">
                                                                <span className="pill-id">#{prob.questionId}</span>
                                                                <a href={prob.url} target="_blank" rel="noreferrer" className="pill-title">
                                                                    {prob.title}
                                                                </a>
                                                                
                                                            </div>
                                                            <div className="pill-actions">
                                                                <Link 
                                                                    to={`/solution/${prob.questionId || prob.slug}`}
                                                                    className={`pill-btn ${prob.hasSolution ? 'pill-btn-view' : 'pill-btn-generate'}`}
                                                                >
                                                                    {prob.hasSolution ? (
                                                                        <> Solution</>
                                                                    ) : (
                                                                        <> Solution</>
                                                                    )}
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                                                    No problem data loaded yet.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isGuest && (
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <div className="glass-panel" style={{ display: 'inline-block', padding: '30px 50px', background: 'rgba(20,20,25,0.8)' }}>
                        <FaLock size={28} color="#f57c00" style={{ marginBottom: '15px' }} />
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>Unlock Your Progress</h3>
                        <p style={{ color: '#aaa', fontSize: '0.95rem', marginBottom: '20px', maxWidth: '350px' }}>
                            Log in to sync your LeetCode profile and permanently track your journey through the Mastery Path.
                        </p>
                        <Link to="/login" className="login-btn glow-btn" style={{ background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)', color: 'white', padding: '12px 30px', borderRadius: '30px', fontWeight: '800', letterSpacing: '1px' }}>Log In to Sync</Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BasicToAdvancePage;
