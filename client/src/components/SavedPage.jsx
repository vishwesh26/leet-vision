import React from 'react';
import VideoCard from './VideoCard';
import SEO from './SEO';
import { Link } from 'react-router-dom';

const SavedPage = ({ savedVideos, onToggleSave }) => {
    return (
        <>
            <SEO title="Saved Solutions" description="Your saved LeetCode video solutions." path="/saved" />

            <section className="results-container">
                <h2 className="results-header">Saved Videos</h2>

                {savedVideos.length === 0 && (
                    <div style={{ color: '#888', textAlign: 'center', marginTop: '3rem' }}>
                        <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No saved videos yet.</p>
                        <p>Start searching or browsing lists to add some!</p>
                        <div style={{ marginTop: '2rem' }}>
                            <Link to="/top-100-leetcode" style={{ color: 'var(--accent-orange)', textDecoration: 'none', border: '1px solid var(--accent-orange)', padding: '0.8rem 1.5rem', borderRadius: '50px' }}>
                                Browse Top 100
                            </Link>
                        </div>
                    </div>
                )}

                {savedVideos.length > 0 && (
                    <div className="results-grid">
                        {savedVideos.map((video) => (
                            <VideoCard
                                key={video.id}
                                video={video}
                                isTopResult={false}
                                isSaved={true}
                                onToggleSave={onToggleSave}
                            />
                        ))}
                    </div>
                )}
            </section>
        </>
    );
};

export default SavedPage;
