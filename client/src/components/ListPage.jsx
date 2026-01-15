import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
        pageTitle = `${capitalized} LeetCode Questions`;
        description = `Practice ${capitalized} LeetCode interview questions.`;
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
    // effectiveType handles itself via propType.

    if (propType === 'difficulty' && !param && propParam) {
        param = propParam;
    }


    useEffect(() => {
        const fetchList = async () => {
            setLoading(true);
            setError('');
            setVideos([]);

            try {
                const API_BASE = import.meta.env.VITE_API_URL;

                const queryParams = new URLSearchParams();
                if (effectiveType === 'difficulty') queryParams.append('difficulty', param);

                // For topic/company, we pass as 'param' query
                if (effectiveType === 'topic' || effectiveType === 'company') queryParams.append('param', param);

                const url = `${API_BASE}/api/list/${effectiveType}?${queryParams.toString()}`;
                const response = await axios.get(url);
                if (Array.isArray(response.data)) {
                    setVideos(response.data);
                } else {
                    console.error("Expected array but got:", response.data);
                    setVideos([]);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load list. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchList();
    }, [effectiveType, param]);

    const isSaved = (videoId) => {
        return savedVideos.some(v => v.id === videoId);
    };



    return (
        <>
            <SEO title={pageTitle} description={description} path={window.location.pathname} />



            <section className="results-container">
                <h2 className="results-header">{pageTitle}</h2>

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

                                    // Correctly prioritize Problem ID/Title
                                    // 'video' is primarily the Problem Object from the API
                                    // 'videoData' might be the nested YouTube object

                                    const problemId = video.id || videoData.questionId || videoData.id;
                                    const title = video.title || videoData.title;
                                    const slug = video.slug || videoData.slug;
                                    const difficulty = video.difficulty || videoData.difficulty;

                                    const hasVideo = video.video || (videoData && videoData.viewCount !== undefined);
                                    const saved = isSaved(videoData.id || video.id);

                                    // Check if solved (using the whole problem object which has slug)
                                    // Sometimes video is the object, sometimes video.video.
                                    // Safe check: pass object that has slug.
                                    const problemObj = videoData.slug ? videoData : (video.slug ? video : null);
                                    const solved = problemObj ? isProblemSolved(problemObj) : false;

                                    // Normalized Object for Modal
                                    const modalObj = { id: problemId, title: title };

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
            </section>
        </>
    );
};

export default ListPage;
