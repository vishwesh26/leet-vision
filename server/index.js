const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const NodeCache = require('node-cache');
const axios = require('axios');

dotenv.config();

const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Persistent Cache Path
const CACHE_FILE = path.join(__dirname, 'data', 'videoCache.json');

// Memory Store for Cache (loaded from file)
let videoCache = {};

// Load cache from disk
try {
    if (fs.existsSync(CACHE_FILE)) {
        const data = fs.readFileSync(CACHE_FILE, 'utf8');
        videoCache = JSON.parse(data);
        console.log(`Loaded ${Object.keys(videoCache).length} items from cache.`);
    }
} catch (err) {
    console.error('Error loading cache:', err);
    videoCache = {};
}

// Helper: Save Cache
const saveCache = () => {
    try {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(videoCache, null, 2));
    } catch (err) {
        console.error('Error saving cache:', err);
    }
};

app.use(cors());
app.use(express.json());

// Helper: Get or Fetch Video (Quota Efficient)
const getOrFetchVideo = async (questionId) => {
    // 1. Check Cache
    if (videoCache[questionId]) {
        console.log(`Cache HIT for ${questionId}`);
        // Handle legacy single-object cache (wrap in array)
        if (!Array.isArray(videoCache[questionId])) {
             return [videoCache[questionId]];
        }
        return videoCache[questionId];
    }

    // 2. Mock Logic if NO Key
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
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

    // 3. Live Fetch (Only if missing and key exists)
    try {
        console.log(`Cache MISS for ${questionId} - Fetching API...`);
        const query = `LeetCode ${questionId} solution`;
        
        // Search - Fetch 5 results (Same quota cost as 1)
        const searchRes = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: { part: 'snippet', q: query, type: 'video', maxResults: 5, key: YOUTUBE_API_KEY }
        });

        if (!searchRes.data.items || searchRes.data.items.length === 0) return [];

        const videoIds = searchRes.data.items.map(item => item.id.videoId).join(',');
        
        // Get Stats for all 5
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
            isMostAccurate: false, // Set below
            videoUrl: `https://www.youtube.com/watch?v=${vid.id}`
        }));

        // Sort by Views
        videos.sort((a, b) => b.viewCount - a.viewCount);

        // Mark Top Result
        if (videos.length > 0) videos[0].isMostAccurate = true;

        // Update Cache
        videoCache[questionId] = videos;
        saveCache(); // Persist to disk

        return videos;
    } catch (e) {
        console.error(`Fetch failed for ${questionId}:`, e.message);
        return [];
    }
};


// Health Check
app.get('/', (req, res) => {
    res.send('LeetCode Video Search API (Efficient Cached) is running');
});

// Search Endpoint (Manual)
app.get('/api/search/:questionId', async (req, res) => {
    const { questionId } = req.params;
    if (!questionId) return res.status(400).json({ error: 'ID required' });

    // Returns Array of videos
    const videos = await getOrFetchVideo(questionId);
    
    if (videos && videos.length > 0) {
        return res.json(videos); 
    }

    return res.status(404).json({ error: 'No video found' });
});

// List Endpoint
app.get('/api/list/:type', async (req, res) => {
    const { type } = req.params;
    const { difficulty } = req.query;

    const questions = {
        'top-100': ['1', '2', '3', '5', '11', '15', '20', '21', '42', '53'],
        'blind-75': ['1', '15', '33', '49', '53', '54', '55', '56', '57', '62'],
        'important': ['4', '10', '23', '33', '42', '76', '98', '121', '146', '200']
    };

    let targetIds = questions[type] || [];
    
     if (type === 'difficulty' && difficulty) {
        if (difficulty === 'Easy') targetIds = ['1', '9', '13', '14', '20', '21', '26', '27', '28', '35'];
        if (difficulty === 'Medium') targetIds = ['2', '3', '5', '6', '7', '8', '11', '12', '15', '17'];
        if (difficulty === 'Hard') targetIds = ['4', '10', '23', '25', '30', '32', '37', '41', '42', '44'];
    }

    if (targetIds.length === 0) return res.json([]);

    // Fetch all, but map to only TOP result for the list
    const results = await Promise.all(targetIds.map(async (id) => {
        const videos = await getOrFetchVideo(id);
        if (videos && videos.length > 0) return videos[0]; // Return only best one
        return null;
    }));
    
    res.json(results.filter(v => v !== null));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
