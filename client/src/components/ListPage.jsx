import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import VideoCard from './VideoCard';
import SEO from './SEO';
import { useAuth } from '../context/AuthContext';
import { useSolved } from '../context/SolvedContext';
import { FaBrain, FaLock, FaPlus, FaEdit } from 'react-icons/fa';
import { SiLeetcode } from 'react-icons/si';



const ListPage = ({ type: propType, title: propTitle, param: propParam, savedVideos, onToggleSave }) => {
    const { difficulty, topic, company } = useParams();
    const { isProblemSolved } = useSolved();

    // State
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const API_BASE = import.meta.env.VITE_API_URL || '';

    // Determine effective type and params
    let effectiveType = propType;
    let param = propParam || '';
    let pageTitle = propTitle || 'LeetCode Solutions';
    let description = "Browse curated LeetCode questions.";

    if (difficulty) {
        effectiveType = 'difficulty';
        param = difficulty;
        pageTitle = `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Questions`;
    } else if (topic) {
        effectiveType = 'topic';
        param = topic;
        pageTitle = `Top ${topic.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')} Questions`;
    } else if (company) {
        effectiveType = 'company';
        param = company;
        pageTitle = `${company} Interview Questions`;
    }

    if (propType === 'difficulty' && !param && propParam) {
        param = propParam;
    }

    useEffect(() => {
        setVideos([]);
        setPage(1);
        setHasMore(true);
    }, [difficulty, topic, company, propType, propParam]);

    useEffect(() => {
        const fetchList = async () => {
            setLoading(true);
            setError('');
            try {
                const queryParams = new URLSearchParams();
                if (effectiveType === 'difficulty') queryParams.append('difficulty', param);
                if (effectiveType === 'topic' || effectiveType === 'company') queryParams.append('param', param);
                queryParams.append('page', page);
                queryParams.append('limit', 20);

                const response = await axios.get(`${API_BASE}/api/list/${effectiveType}?${queryParams.toString()}`);
                const resData = response.data;

                let newItems = Array.isArray(resData) ? resData : (resData.data || []);
                let hasMoreItems = Array.isArray(resData) ? false : (resData.hasMore || false);

                setVideos(prev => page === 1 ? newItems : [...prev, ...newItems]);
                setHasMore(hasMoreItems);
            } catch (err) {
                setError('Failed to load list. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchList();
    }, [effectiveType, param, page]);

    return (
        <div className="explore-page list-view-standard">
            <SEO title={pageTitle} description={description} path={window.location.pathname} />
            <style>{`
                .list-view-standard {
                    padding: 40px 20px;
                    background: #000;
                    min-height: 100vh;
                    color: #fff;
                    font-family: 'DM Sans', sans-serif;
                }
                .grid-header-custom {
                    display: grid;
                    grid-template-columns: 80px 1fr 140px 140px 120px;
                    gap: 20px;
                    padding: 0 25px 15px;
                    margin-bottom: 10px;
                    border-bottom: 1px solid #222;
                    color: #666;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-weight: 700;
                }
                .gate-btn {
                    display: inline-block;
                    background: #ffa116;
                    color: #000;
                    text-decoration: none;
                    padding: 12px 30px;
                    border-radius: 12px;
                    font-weight: 700;
                    transition: 0.2s;
                    border: none;
                    cursor: pointer;
                }
                .gate-btn:hover {
                    background: white;
                    transform: scale(1.05);
                }
                .state-msg {
                    text-align: center;
                    padding: 60px;
                    color: #666;
                    font-size: 1.1rem;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes fadeIn { 
                    from { opacity: 0; transform: translateY(10px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                .fade-in { animation: fadeIn 0.4s ease-out forwards; }
                
                .platform-icon-box {
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    width: 32px; 
                    height: 32px; 
                    border-radius: 8px; 
                    background: #1a1a1a; 
                    border: 1px solid #333;
                    transition: 0.2s;
                }
                .platform-icon-box:hover {
                    border-color: #666;
                    background: #222;
                }
                .problem-title-link {
                    font-weight: 600; 
                    color: #e0e0e0; 
                    font-size: 1rem; 
                    text-decoration: none;
                    transition: 0.2s;
                    white-space: nowrap; 
                    overflow: hidden; 
                    text-overflow: ellipsis;
                    display: block;
                }
                .problem-title-link:hover {
                    color: #ffa116;
                    transform: translateX(4px);
                }
            `}</style>

            <div className="container">
                <header className="page-header">
                    <h1 className="page-title">{pageTitle.split(' ').slice(0, -1).join(' ')} <span className="highlight-text">{pageTitle.split(' ').pop()}</span></h1>
                    <p className="page-subtitle">{description}</p>
                </header>

                <div className="problems-container">
                    <div className="grid-header-custom">
                        <div>#ID</div>
                        <div>Problem Title</div>
                        <div>Status</div>
                        <div>Solution</div>
                        <div>Difficulty</div>
                    </div>

                    <div className="problems-list" style={{ position: 'relative' }}>
                        {videos.map((video, index) => {
                            const videoData = video.video || video;
                            const problemId = videoData.questionId || videoData.id || video.id;
                            const solved = isProblemSolved(videoData.slug ? videoData : (video.slug ? video : {}));

                            return (
                                <ProblemRow
                                    key={problemId}
                                    p={{
                                        ...videoData,
                                        platform: 'leetcode',
                                        questionId: problemId,
                                        title: videoData.title || video.title,
                                        slug: videoData.slug || video.slug,
                                        difficulty: videoData.difficulty || video.difficulty,
                                        concept_id: videoData.concept_id || video.concept_id
                                    }}
                                    solved={solved}
                                    saved={savedVideos.some(v => v.id === videoData.id)}
                                    onToggleSave={onToggleSave}
                                />
                            );
                        })}
                    </div>

                    {loading && videos.length === 0 && <div className="state-msg">Loading challenges...</div>}
                    {error && <div className="state-msg" style={{ color: '#ff4444' }}>{error}</div>}
                    {!loading && videos.length === 0 && !error && <div className="state-msg">No questions found.</div>}

                    {hasMore && !loading && (
                        <div style={{ textAlign: 'center', marginTop: '50px' }}>
                            <button className="gate-btn" onClick={() => setPage(p => p + 1)}>Load More Questions</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Reusable ProblemRow simplified for ListPage
const ProblemRow = ({ p, solved, saved, onToggleSave }) => {
    const { user } = useAuth();
    const dStyle = (diff) => {
        const d = diff?.toLowerCase();
        if (d === 'easy') return { bg: 'rgba(0,184,163,0.1)', color: '#00B8A3', border: 'rgba(0,184,163,0.2)' };
        if (d === 'medium') return { bg: 'rgba(255,192,30,0.1)', color: '#FFC01E', border: 'rgba(255,192,30,0.2)' };
        if (d === 'hard') return { bg: 'rgba(255,55,95,0.1)', color: '#FF375F', border: 'rgba(255,55,95,0.2)' };
        return { bg: 'rgba(255,255,255,0.05)', color: '#888', border: 'rgba(255,255,255,0.1)' };
    };
    const style = dStyle(p.difficulty);

    return (
        <div className="problem-card fade-in" style={{
            display: 'grid', gridTemplateColumns: '80px 1fr 140px 140px 120px', gap: '20px',
            padding: '18px 25px', marginBottom: '10px', borderRadius: '16px', background: '#111',
            border: '1px solid #1a1a1a', alignItems: 'center', transition: '0.3s'
        }}>
            <div style={{ color: '#555', fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 600 }}>#{p.questionId}</div>
            <a href={`https://leetcode.com/problems/${p.slug}`} target="_blank" rel="noreferrer" className="problem-title-link">
                {p.title}
            </a>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <a href={`https://leetcode.com/problems/${p.slug}`} target="_blank" rel="noreferrer" className="platform-icon-box" style={{ textDecoration: 'none' }}>
                    <SiLeetcode color="#FFA116" size={16} />
                </a>
                {solved && <span style={{ color: '#00b8a3', fontSize: '1.1rem' }}>✅</span>}
                <span onClick={() => onToggleSave(p)} style={{ cursor: 'pointer', fontSize: '1.2rem', opacity: saved ? 1 : 0.2 }}>
                    🔖
                </span>
            </div>

            <div>
                <Link
                    to={p.platform === 'leetcode' && p.questionId ? `/solution/${p.questionId}` : `/universe/solution/${p.platform}/${p.slug}`}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '8px 14px', background: 'rgba(255,161,22,0.1)', color: '#ffa116',
                        borderRadius: '8px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 700,
                        border: '1px solid rgba(255,161,22,0.2)'
                    }}
                >
                    <FaBrain size={12} /> Solution
                </Link>
                {user?.isAdmin && (
                    <Link
                        to={`/admin/${p.hasSolution ? 'edit' : 'add'}-solution/${p.questionId}`}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                            marginTop: '6px', fontSize: '0.7rem', color: p.hasSolution ? '#4db6ac' : '#ffa116',
                            textDecoration: 'none', fontWeight: 600
                        }}
                    >
                        {p.hasSolution ? <><FaEdit size={10} /> Edit</> : <><FaPlus size={10} /> Add</>}
                    </Link>
                )}
            </div>

            <div>
                <span style={{
                    display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem',
                    fontWeight: 800, textTransform: 'uppercase', background: style.bg, color: style.color, border: `1px solid ${style.border}`
                }}>
                    {p.difficulty || '-'}
                </span>
            </div>
        </div>
    );
};


export default ListPage;
