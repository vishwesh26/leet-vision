import React from 'react';

const VideoCard = ({ video, isTopResult, onToggleSave, isSaved }) => {
    // Normalize data: "video" prop could be a Video Object OR a Problem Object with a nested "video" field
    const videoData = video.video || video;

    // Check if we have valid video data.
    // We assume it's valid if it has a 'viewCount' (Video Object).
    // If it's a Problem object with NO video, video.video is undefined, so videoData is the Problem object (which has no viewCount).
    const hasVideo = videoData && (videoData.viewCount !== undefined || video.video !== undefined);

    // Fallback for "No Video" state
    // If hasVideo is false, it means we likely have a Problem object but no solution video logic matched/fetched.
    if (!hasVideo && !videoData.viewCount) {
        return (
            <div className={`video-card ${isTopResult ? 'top-result' : ''}`} style={{ minHeight: '150px' }}>
                <div className="card-content">
                    <h3 className="card-title">{video.title || "Unknown Problem"}</h3>
                    <div className="stats" style={{ borderTop: 'none', fontStyle: 'italic', color: '#888' }}>
                        No video solution found yet.
                    </div>
                </div>
            </div>
        );
    }

    const { id, title, channelTitle, viewCount, likeCount } = videoData;

    // derived from the parent "video" (Problem Object) if available
    const problemId = video.id || id; // Problem ID should be from the parent if possible
    const slug = video.slug;
    const difficulty = video.difficulty;
    const topics = video.topics || [];
    const leetcodeUrl = slug ? `https://leetcode.com/problems/${slug}` : null;

    return (
        <div className={`video-card ${isTopResult ? 'top-result' : ''}`}>
            {isTopResult && <div className="badge-accurate">Most Accurate</div>}

            {/* Problem Header (Only if we have problem data like slug/diff) */}
            {slug && (
                <div className="card-header" style={{ padding: '1rem 1rem 0.5rem 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <a href={leetcodeUrl} target="_blank" rel="noreferrer" className="problem-link">
                            <span style={{ color: 'var(--accent-orange)', marginRight: '0.5rem' }}>{problemId}.</span>
                            {video.title || title}
                            <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', color: '#888' }}>🔗</span>
                        </a>
                        {difficulty && (
                            <span className={`badge-difficulty ${difficulty.toLowerCase()}`}>
                                {difficulty}
                            </span>
                        )}
                    </div>
                    {topics.length > 0 && (
                        <div className="topic-tags">
                            {topics.slice(0, 3).map(t => (
                                <span key={t} className="topic-tag">{t}</span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <button
                className={`save-btn ${isSaved ? 'saved' : ''}`}
                style={{ top: slug ? '15px' : '10px' }} // Adjust position based on header
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(videoData);
                }}
                title={isSaved ? "Remove from Saved" : "Save Video"}
            >
                {isSaved ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                )}
            </button>

            <div className="thumbnail-container">
                <iframe
                    src={`https://www.youtube.com/embed/${id}`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe >
            </div >

            <div className="card-content">
                {/* If we showed title up top, maybe don't show it here, or show video specific title? */}
                {!slug && <h3 className="card-title" dangerouslySetInnerHTML={{ __html: title }}></h3>}

                <div className="channel-name">
                    <span>{channelTitle || "Unknown Channel"}</span>
                </div>

                <div className="stats">
                    <span>👁️ {(viewCount || 0).toLocaleString()} views</span>
                    <span>👍 {(likeCount || 0).toLocaleString()} likes</span>
                </div>
            </div>
        </div >
    );
};

export default VideoCard;
