
import React from 'react';

const VideoCard = ({ video, isTopResult, onToggleSave, isSaved }) => {
    return (
        <div className={`video-card ${isTopResult ? 'top-result' : ''}`}>
            {isTopResult && <div className="badge-accurate">Most Accurate</div>}

            <button
                className={`save-btn ${isSaved ? 'saved' : ''}`}
                onClick={(e) => {
                    e.stopPropagation(); // Prevent card click if we had one
                    onToggleSave(video);
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
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe >
            </div >

            <div className="card-content">
                <h3 className="card-title" dangerouslySetInnerHTML={{ __html: video.title }}></h3>
                <div className="channel-name">
                    <span>{video.channelTitle}</span>
                </div>

                <div className="stats">
                    <span>👁️ {video.viewCount.toLocaleString()} views</span>
                    <span>👍 {video.likeCount.toLocaleString()} likes</span>
                </div>
            </div>
        </div >
    );
};

export default VideoCard;
