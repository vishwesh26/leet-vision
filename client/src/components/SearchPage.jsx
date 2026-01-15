import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import VideoCard from './VideoCard';
import SEO from './SEO';

const SearchPage = ({ savedVideos, onToggleSave }) => {
    const { questionId } = useParams();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            if (!questionId) return;
            setLoading(true);
            setError('');
            setVideos([]);

            try {
                const API_BASE = import.meta.env.VITE_API_URL || '';
                const response = await axios.get(`${API_BASE}/api/search/${questionId}`);
                setVideos(response.data);
            } catch (err) {
                console.error(err);
                setError('No videos found or service unavailable.');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [questionId]);


    const isSaved = (videoId) => {
        return savedVideos.some(v => v.id === videoId);
    };

    return (
        <>
            <SEO title={`Solution for ${questionId}`} description={`Watch the best video solution for LeetCode ${questionId}.`} path={`/search/${questionId}`} />

            <section className="results-container">
                <h2 className="results-header">Results for "{questionId}"</h2>

                {loading && <div className="loading-container">Loading...</div>}

                {error && (
                    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                        <p style={{ color: '#ff4444', fontSize: '1.2rem' }}>{error}</p>
                        <p style={{ color: '#888' }}>Try searching for a valid question number (e.g. 1, 200, 42).</p>
                    </div>
                )}

                {!loading && videos.length > 0 && (
                    <div className="results-grid">
                        {videos.map((video, index) => (
                            <VideoCard
                                key={video.id}
                                video={video}
                                isTopResult={index === 0}
                                isSaved={isSaved(video.id)}
                                onToggleSave={onToggleSave}
                            />
                        ))}
                    </div>
                )}
            </section>
        </>
    );
};

export default SearchPage;
