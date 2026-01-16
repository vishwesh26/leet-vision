import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import VideoCard from './VideoCard';
import SEO from './SEO';
import { useSolved } from '../context/SolvedContext';



const ListPage = ({ type: propType, title: propTitle, param: propParam, savedVideos, onToggleSave }) => {
    const { difficulty, topic, company } = useParams();
    const { isProblemSolved } = useSolved();

    // State
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Determine effective type and params
    let effectiveType = propType;
    let param = propParam || ''; // Default to propParam if exists
    let pageTitle = propTitle || 'LeetCode Solutions';
    let description = "Browse curated LeetCode questions.";

    // Priority 1: URL Params (Dynamic Routes) override static props for param value
    if (difficulty) {
        effectiveType = 'difficulty';
        param = difficulty;
        const capitalized = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        pageTitle = `${capitalized} Questions`;
        description = `Practice ${capitalized} interview questions.`;
    } else if (topic) {
        effectiveType = 'topic';
        param = topic;
        const capitalizedTopic = topic.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        pageTitle = `Top ${capitalizedTopic} Questions`;
        description = `Master ${capitalizedTopic} for coding interviews.`;
    } else if (company) {
        effectiveType = 'company';
        param = company;
        pageTitle = `${company} Interview Questions`;
    }

    // Priority 2: If still no param, and we have a propParam (Static Routes like /leetcode-easy), use it.
    if (propType === 'difficulty' && !param && propParam) {
        param = propParam;
    }

    // Reset State on Param Change
    useEffect(() => {
        setVideos([]);
        setPage(1);
        setHasMore(true);
        // We don't trigger fetch here, purely state reset.
        // The dependency on 'page' (which we just set to 1) or 'param' in the next effect will trigger fetch.
    }, [difficulty, topic, company, propType, propParam]);


    useEffect(() => {
        const fetchList = async () => {
            setLoading(true);
            setError('');

            // Should we clear videos if page is 1? Yes, to avoid stale data flicker if param changed
            if (page === 1) {
                // But we already did setVideos([]) in the other effect? 
                // It's safer to not clear here to avoid double render flicker, but handling race conditions is key.
                // We rely on the reset effect.
            }

            try {
                const API_BASE = import.meta.env.VITE_API_URL || '';
                let url;

                // LeetCode Endpoint
                const queryParams = new URLSearchParams();
                if (effectiveType === 'difficulty') queryParams.append('difficulty', param);
                if (effectiveType === 'topic' || effectiveType === 'company') queryParams.append('param', param);

                queryParams.append('page', page);
                queryParams.append('limit', 20);

                url = `${API_BASE}/api/list/${effectiveType}?${queryParams.toString()}`;

                const response = await axios.get(url);
                const resData = response.data;

                // Handle both Object (new) and Array (old/fallback) formats
                let newItems = [];
                let hasMoreItems = false;

                if (Array.isArray(resData)) {
                    // Fallback for non-paginated endpoints
                    newItems = resData;
                    hasMoreItems = false;
                } else if (resData.data && Array.isArray(resData.data)) {
                    newItems = resData.data;
                    hasMoreItems = resData.hasMore;
                }

                if (page === 1) {
                    setVideos(newItems);
                } else {
                    setVideos(prev => [...prev, ...newItems]);
                }

                setHasMore(hasMoreItems);

            } catch (err) {
                console.error(err);
                setError('Failed to load list. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchList();
    }, [effectiveType, param, page]);

    const isSaved = (videoId) => {
        return savedVideos.some(v => v.id === videoId);
    };

    return (
        <>
            <SEO title={pageTitle} description={description} path={window.location.pathname} />

            <section className="results-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <h2 className="results-header" style={{ marginBottom: 0 }}>{pageTitle}</h2>

                    {/* Source Toggle Removed */}
                </div>

                {loading && (
                    <div className="problem-list-container">
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading problems...</div>
                    </div>
                )}

                {error && <div style={{ color: '#ff4444', textAlign: 'center', marginTop: '2rem' }}>{error}</div>}

                {!loading && videos.length === 0 && !error && (
                    <div style={{ color: '#888', textAlign: 'center', marginTop: '3rem' }}>
                        No questions found for this category.
                    </div>
                )}

                {!loading && Array.isArray(videos) && videos.length > 0 && (
                    <div className="problem-list-container">
                        <table className="problem-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>Status</th>
                                    <th>Title</th>
                                    <th>Solution</th>
                                    <th>Difficulty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {videos.map((video) => {
                                    const videoData = video.video || video;
                                    const problemId = video.id || videoData.questionId || videoData.id;
                                    const title = video.title || videoData.title;
                                    const slug = video.slug || videoData.slug;
                                    const difficulty = video.difficulty || videoData.difficulty;
                                    const hasVideo = video.video || (videoData && videoData.viewCount !== undefined);
                                    const saved = isSaved(videoData.id || video.id);

                                    // Check solved status only for LeetCode
                                    const problemObj = videoData.slug ? videoData : (video.slug ? video : null);
                                    const solved = problemObj ? isProblemSolved(problemObj) : false;

                                    return (
                                        <tr key={problemId} className={solved ? 'solved-row' : ''}>
                                            <td style={{ textAlign: 'center' }}>
                                                {saved ? (
                                                    <span
                                                        onClick={() => onToggleSave(videoData)}
                                                        style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                                                        title="Remove from Saved"
                                                    >
                                                        🔖
                                                    </span>
                                                ) : (
                                                    <span
                                                        onClick={() => onToggleSave(videoData)}
                                                        style={{ cursor: 'pointer', opacity: 0.3, fontSize: '1.2rem' }}
                                                        title="Save Video"
                                                    >
                                                        🔖
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="problem-cell">
                                                    <span style={{
                                                        fontSize: '0.8rem',
                                                        background: '#ffffff11',
                                                        color: '#aaa',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        marginRight: '8px',
                                                        minWidth: '24px',
                                                        textAlign: 'center'
                                                    }}>
                                                        LC
                                                    </span>
                                                    <a
                                                        href={slug ? `https://leetcode.com/problems/${slug}` : '#'}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="problem-title-link"
                                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                    >
                                                        {problemId}. {title}
                                                        {solved && <span style={{ color: '#00b8a3', fontSize: '1rem' }} title="Solved on LeetCode">✅</span>}
                                                    </a>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <a href={`/search/${problemId}`} className="btn-solution"
                                                        style={!hasVideo ? { opacity: 0.8, background: 'rgba(255,255,255,0.1)' } : {}}
                                                        title="Watch Video Solution"
                                                    >
                                                        <span className="icon">▶</span> {hasVideo ? 'Video' : 'Watch'}
                                                    </a>

                                                    <Link
                                                        to={`/solution/${problemId}`}
                                                        className="btn-solution"
                                                        style={{
                                                            background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
                                                            color: 'white',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold',
                                                            textDecoration: 'none',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            marginLeft: '0.5rem',
                                                            padding: '0.4rem 0.8rem',
                                                            borderRadius: '4px',
                                                            fontSize: '0.9rem'
                                                        }}
                                                        title="AI Optimized Solution"
                                                    >
                                                        ⚡ Code
                                                    </Link>
                                                </div>
                                            </td>

                                            <td>
                                                {difficulty && (
                                                    <span className={`badge-difficulty ${difficulty.toLowerCase()}`}>
                                                        {difficulty}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {hasMore && !loading && (
                    <div style={{ textAlign: 'center', marginTop: '3rem', paddingBottom: '2rem' }}>
                        <button
                            onClick={() => setPage(prev => prev + 1)}
                            style={{
                                padding: '12px 30px',
                                background: '#222',
                                color: '#ccc',
                                border: '1px solid #333',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '500',
                                transition: 'all 0.2s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = '#333';
                                e.currentTarget.style.color = '#fff';
                                e.currentTarget.style.borderColor = '#555';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = '#222';
                                e.currentTarget.style.color = '#ccc';
                                e.currentTarget.style.borderColor = '#333';
                            }}
                        >
                            Load More
                        </button>
                    </div>
                )}

                {loading && videos.length > 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Loading more...</div>
                )}
            </section>
        </>
    );
};

export default ListPage;
