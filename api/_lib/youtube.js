const axios = require('axios');
const fs = require('fs');
const path = require('path');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const CACHE_FILE = path.join(__dirname, '../data/videoCache.json');

// In-memory cache (survives warm starts)
let videoCache = {};

// Initial Load
try {
    if (fs.existsSync(CACHE_FILE)) {
        const data = fs.readFileSync(CACHE_FILE, 'utf8');
        videoCache = JSON.parse(data);
        console.log(`[YouTube Lib] Loaded ${Object.keys(videoCache).length} items from cache.`);
    }
} catch (err) {
    console.error('[YouTube Lib] Error loading cache:', err);
    videoCache = {};
}

// Helper: Save Cache (Local only)
const saveCache = () => {
    try {
        if (process.env.NODE_ENV === 'production') return;
        fs.writeFileSync(CACHE_FILE, JSON.stringify(videoCache, null, 2));
    } catch (err) {
        console.warn('[YouTube Lib] Cache save skipped:', err.message);
    }
};

const getOrFetchVideo = async (questionId, fetchIfMissing = true) => {
    if (videoCache[questionId]) {
        if (!Array.isArray(videoCache[questionId])) {
             return [videoCache[questionId]];
        }
        return videoCache[questionId];
    }

    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
        // Mock
        const mockVideo = {
            id: `mock_${questionId}`,
            questionId: questionId,
            title: `LeetCode ${questionId} Solution (Mock)`,
            channelTitle: 'Mock Channel',
            thumbnail: 'https://i.ytimg.com/vi/mock/hqdefault.jpg',
            viewCount: 1000,
            likeCount: 50,
            isMostAccurate: true,
            publishedAt: new Date().toISOString()
        };
        const mockArray = [mockVideo];
        videoCache[questionId] = mockArray; 
        return mockArray;
    }

    if (!fetchIfMissing) return [];

    try {
        console.log(`[YouTube Lib] Cache MISS for ${questionId} - Fetching API...`);
        const query = `LeetCode ${questionId} solution`;
        
        const searchRes = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: { part: 'snippet', q: query, type: 'video', maxResults: 5, key: YOUTUBE_API_KEY }
        });

        if (!searchRes.data.items || searchRes.data.items.length === 0) return [];

        const videoIds = searchRes.data.items.map(item => item.id.videoId).join(',');
        
        const statsRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
            params: { part: 'statistics,snippet', id: videoIds, key: YOUTUBE_API_KEY }
        });

        if (!statsRes.data.items || statsRes.data.items.length === 0) return [];

        let videos = statsRes.data.items.map(vid => ({
            id: vid.id,
            questionId: questionId,
            title: vid.snippet.title,
            channelTitle: vid.snippet.channelTitle,
            thumbnail: vid.snippet.thumbnails.high.url,
            viewCount: parseInt(vid.statistics.viewCount) || 0,
            likeCount: parseInt(vid.statistics.likeCount) || 0,
            publishedAt: vid.snippet.publishedAt,
            isMostAccurate: false, 
            videoUrl: `https://www.youtube.com/watch?v=${vid.id}`
        }));

        videos.sort((a, b) => b.viewCount - a.viewCount);
        if (videos.length > 0) videos[0].isMostAccurate = true;

        videoCache[questionId] = videos;
        saveCache();

        return videos;
    } catch (e) {
        console.error(`[YouTube Lib] Fetch failed for ${questionId}:`, e.message);
        return [];
    }
};

module.exports = { getOrFetchVideo };
