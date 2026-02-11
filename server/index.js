const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const NodeCache = require('node-cache');
const axios = require('axios');

dotenv.config();

const fs = require('fs');
const path = require('path');
const CompanyQuestion = require('./models/CompanyQuestion');
const mongoose = require('mongoose');
const slugify = require('slugify');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const User = require('./models/User'); 
const Purchase = require('./models/Purchase');
const StoredVideo = require('./models/StoredVideo');
const SurveyResponse = require('./models/SurveyResponse');
const jwt = require('jsonwebtoken');
const Concept = require('./models/Concept');
const UniversalProblem = require('./models/UniversalProblem');
const Explanation = require('./models/Explanation');
const Report = require('./models/Report');
const { protect, admin } = require('./middleware/authMiddleware');
const passport = require('passport');
require('./config/passport');

const app = express();
app.use(passport.initialize());
const PORT = process.env.PORT || 5000;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Persistent Cache Path
// Define path relative to where script is running, but handle Vercel structure
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
        // Vercel is Read-Only in production runtime. preventing crash.
        // We only try to save if we think we can (local), but try-catch is safest.
        if (process.env.NODE_ENV === 'production') return; 
        
        fs.writeFileSync(CACHE_FILE, JSON.stringify(videoCache, null, 2));
    } catch (err) {
        console.warn('Cache save skipped (Read-Only FS or Error):', err.message);
    }
};

app.use(cors({
    origin: [
        'http://localhost:5173', 
        'http://localhost:5174', 
        'http://localhost:3000',
        'https://leet-vision.vercel.app'
    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Auth Routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);

// Report Endpoint
app.post('/api/report', async (req, res) => {
    try {
        const { questionId, title, platform, reason, details, correctSolution } = req.body;
        
        if (!questionId || !reason) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newReport = await Report.create({
            questionId,
            title,
            platform,
            reason,
            details,
            correctSolution
        });

        console.log(`Report received for ${questionId}: ${reason}`);
        res.status(201).json({ status: 'success', message: 'Report submitted successfully', data: newReport });
    } catch (err) {
        console.error('Report Submission Error:', err);
        res.status(500).json({ error: 'Failed to submit report' });
    }
});

// Get All Reports (Admin)
// Import middleware at the top if not already there, but for now assuming it's available or will be imported
app.get('/api/reports', protect, admin, async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        console.error('Error fetching reports:', err);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

// Logo Proxy to avoid frontend 404s
app.get('/api/logo/:domain', async (req, res) => {
    const { domain } = req.params;
    try {
        const services = [
            `https://logo.clearbit.com/${domain}`,
            `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
            `https://icon.horse/icon/${domain}`
        ];
        
        // Try Clearbit first as it's high quality, fallback to Google
        for (const url of services) {
            try {
                const response = await axios.get(url, { 
                    responseType: 'arraybuffer',
                    timeout: 2000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                });
                if (response.status === 200) {
                    res.set('Content-Type', response.headers['content-type']);
                    res.set('Cache-Control', 'public, max-age=86400'); // 24h cache
                    return res.send(response.data);
                }
            } catch (e) {
                continue;
            }
        }
        throw new Error('All services failed');
    } catch (err) {
        // Return a generic transparent 1x1 pixel or a simple SVG to avoid 404
        res.set('Content-Type', 'image/svg+xml');
        res.send('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>');
    }
});

// Load problems database (Using require for Vercel bundling compatibility)
let problemsDb = [];
try {
    // Vercel handles require() better than fs.readFileSync for static assets
    problemsDb = require('./data/problems.json');
    console.log(`Loaded ${problemsDb.length} problems from database.`);
} catch (err) {
    console.error('Error loading problems.json:', err);
    // Fallback or empty
    problemsDb = [];
}

// Load Company Plans
let companyPlans = {};
try {
    companyPlans = require('./data/company_plans.json');
    console.log(`Loaded plans for ${Object.keys(companyPlans).length} companies.`);
} catch (err) {
    console.error('Error loading company_plans.json:', err);
    companyPlans = {};
}

// Load Companies DB
let companiesDb = {};
try {
    companiesDb = require('./data/companies.json');
    console.log(`Loaded ${Object.keys(companiesDb).length} companies from database.`);
} catch (err) {
    console.error('Error loading companies.json:', err);
}

// Load Custom Lists
let blind75Ids = [];
let top100Ids = [];
try {
    blind75Ids = require('./data/blind75.json');
    top100Ids = require('./data/top100.json');
    console.log(`Loaded custom lists: Blind 75 (${blind75Ids.length}), Top 100 (${top100Ids.length})`);
} catch (e) {
    console.error("Failed to load custom lists:", e.message);
}

// Helper: Get or Fetch Video (Quota Efficient)
// fetchIfMissing: true = perform API call if cache miss. false = return null/empty if cache miss.
const getOrFetchVideo = async (questionId, fetchIfMissing = true) => {
    // 1. Check Memory Cache
    if (videoCache[questionId]) {
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

    if (!fetchIfMissing) return [];

    // 3. Live Fetch (Only if missing and key exists AND fetchIfMissing is true)
    try {
        console.log(`Cache MISS for ${questionId} - Fetching YouTube API...`);
        const query = `LeetCode ${questionId} solution`;
        
        // Search - Fetch 5 results
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
            isMostAccurate: false,
            videoUrl: `https://www.youtube.com/watch?v=${vid.id}`
        }));

        // Sort by Views
        videos.sort((a, b) => b.viewCount - a.viewCount);

        // Mark Top Result
        if (videos.length > 0) videos[0].isMostAccurate = true;

        // --- NEW: SAVE BEST RESULT TO DATABASE ---
        if (videos.length > 0) {
            const best = videos[0];
            try {
                await StoredVideo.findOneAndUpdate(
                    { questionId: questionId },
                    {
                        videoId: best.id,
                        title: best.title,
                        channelTitle: best.channelTitle,
                        thumbnail: best.thumbnail,
                        viewCount: best.viewCount,
                        likeCount: best.likeCount,
                        publishedAt: best.publishedAt
                    },
                    { upsert: true, new: true }
                );
                console.log(`Updated StoredVideo for ${questionId} in DB.`);
            } catch (dbErr) {
                console.warn(`Failed to save StoredVideo for ${questionId}:`, dbErr.message);
            }
        }
        // -----------------------------------------

        // Update Memory Cache
        videoCache[questionId] = videos;
        saveCache(); // Persist memory cache to disk results

        return videos;
    } catch (e) {
        console.error(`YouTube API Quota maybe hit for ${questionId}:`, e.message);
        
        // --- NEW: FALLBACK TO DATABASE CACHE ---
        try {
            const savedVideo = await StoredVideo.findOne({ questionId: questionId });
            if (savedVideo) {
                console.log(`FALLBACK: Found StoredVideo for ${questionId} in Database.`);
                const mapped = {
                    id: savedVideo.videoId,
                    questionId: questionId,
                    title: savedVideo.title,
                    channelTitle: savedVideo.channelTitle,
                    thumbnail: savedVideo.thumbnail,
                    viewCount: savedVideo.viewCount,
                    likeCount: savedVideo.likeCount,
                    isMostAccurate: true,
                    publishedAt: savedVideo.publishedAt,
                    videoUrl: `https://www.youtube.com/watch?v=${savedVideo.videoId}`
                };
                videoCache[questionId] = [mapped]; // Update memory cache for subsequent hits
                return [mapped];
            }
        } catch (dbErr) {
            console.error(`DB Fallback search failed for ${questionId}:`, dbErr.message);
        }
        // ---------------------------------------

        // Ultimate Fallback to Mock Data if DB also empty
        const mockVideo = {
            id: `dQw4w9WgXcQ`, 
            questionId: questionId,
            title: `LeetCode ${questionId} Solution (Fallback)`,
            channelTitle: 'LeetVision AI Fallback',
            thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
            viewCount: 999999,
            likeCount: 50000,
            isMostAccurate: true,
            publishedAt: new Date().toISOString(),
            videoUrl: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
        };
        videoCache[questionId] = [mockVideo];
        return [mockVideo];
    }
};


// Health Check
app.get('/', (req, res) => {
    res.send('LeetCode Video Search API (Efficient Cached) is running');
});

// --- Universal System Helpers ---
const normalizeConceptKey = (title) => {
    return slugify(title, { replacement: '_', lower: true, strict: true }).toUpperCase();
};

const getOrFetchUniversalVideos = async (title, conceptId) => {
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') return [];

    try {
        const query = `${title} DSA explanation`;
        console.log(`[YouTube Fetch] Query: "${query}" for Concept: ${conceptId}`);

        const searchRes = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: { part: 'snippet', q: query, type: 'video', maxResults: 5, key: YOUTUBE_API_KEY }
        });

        const items = searchRes.data.items || [];
        console.log(`[YouTube Search] Query: "${query}" - Found: ${items.length} items`);
        
        if (items.length === 0) {
            console.log(`[YouTube Search] Full data:`, JSON.stringify(searchRes.data).substring(0, 500));
            return [];
        }

        const videoIds = searchRes.data.items.map(item => item.id.videoId).join(',');
        const statsRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
            params: { part: 'statistics,snippet,contentDetails', id: videoIds, key: YOUTUBE_API_KEY }
        });

        console.log(`[YouTube Stats] Retrieved stats for ${statsRes.data.items ? statsRes.data.items.length : 0} videos`);

        let videos = statsRes.data.items.map(vid => {
            const duration = vid.contentDetails.duration;
            let seconds = 0;
            const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            if (matches) {
                seconds = (parseInt(matches[1]) || 0) * 3600 + (parseInt(matches[2]) || 0) * 60 + (parseInt(matches[3]) || 0);
            }

            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            const formattedDuration = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;

            return {
                url: `https://www.youtube.com/watch?v=${vid.id}`,
                title: vid.snippet.title,
                channel: vid.snippet.channelTitle,
                views: parseInt(vid.statistics.viewCount) || 0,
                duration: formattedDuration,
                duration_secs: seconds, // Keep raw seconds for sorting
                thumbnail: vid.snippet.thumbnails.high.url
            };
        });

        videos.sort((a, b) => {
            const aIdeal = a.duration_secs >= 240 && a.duration_secs <= 1500;
            const bIdeal = b.duration_secs >= 240 && b.duration_secs <= 1500;
            if (aIdeal && !bIdeal) return -1;
            if (!aIdeal && bIdeal) return 1;
            return b.views - a.views;
        });

        if (conceptId) {
            const videoLinks = videos.slice(0, 3).map((v, i) => ({ 
                url: v.url, 
                title: v.title, 
                channel: v.channel,
                views: v.views, 
                duration: v.duration, 
                thumbnail: v.thumbnail, 
                rank: i + 1 
            }));
            console.log(`[YouTube Fetch] Saving ${videoLinks.length} videos to DB for Concept: ${conceptId._id || conceptId}`);
            const updated = await Explanation.findOneAndUpdate(
                { concept_id: conceptId._id || conceptId },
                { $set: { video_links: videoLinks } },
                { new: true }
            );
            console.log(`[YouTube Fetch] Update Result - Found: ${!!updated}, Links: ${updated ? updated.video_links.length : 0}`);
            return videoLinks; // Return the saved links
        }

        return videos.slice(0, 3).map((v, i) => ({ ...v, rank: i + 1 }));
    } catch (e) {
        console.error("Universal Video Fetch Error:", e.message);
        return [];
    }
};

// Search Endpoint (Manual - Always Fetch)
app.get('/api/search/:questionId', async (req, res) => {
    const { questionId } = req.params;
    if (!questionId) return res.status(400).json({ error: 'ID required' });

    // Returns Array of videos
    const videos = await getOrFetchVideo(questionId, true); // Force fetch
    
    if (videos && videos.length > 0) {
        return res.json(videos); 
    }

    return res.status(404).json({ error: 'No video found' });
});

// List Endpoint
app.get('/api/list/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { difficulty, param, page = 1, limit = 20 } = req.query;

        let filtered = [];
        
        // Ensure problemsDb is available
        if (!Array.isArray(problemsDb)) problemsDb = [];

        if (type === 'top-100') {
            // Filter DB by Top 100 IDs
            // We want to preserve the order of top100Ids
            filtered = top100Ids.map(id => problemsDb.find(p => p.id === id.toString())).filter(Boolean);
            
        } else if (type === 'blind-75') {
             // Filter DB by Blind 75 IDs
            filtered = blind75Ids.map(id => problemsDb.find(p => p.id === id.toString())).filter(Boolean);

        } else if (type === 'difficulty') {
            filtered = problemsDb.filter(p => p.difficulty === difficulty);
            filtered.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        } else if (type === 'topic') {
            const topic = param || difficulty; // Sometimes passed as param
            if (!topic) return res.json({ data: [], hasMore: false });
            filtered = problemsDb.filter(p => p.topics.some(t => t.toLowerCase() === topic.toLowerCase()));
            filtered.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        } else if (type === 'company') {
            // Placeholder - just take first 50 for now
            filtered = problemsDb.slice(0, 50);
            filtered.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        } else {
            // Default / All
            filtered = [...problemsDb];
            filtered.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        }

        // Pagination Logic
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;

        const total = filtered.length;
        const paginatedItems = filtered.slice(startIndex, endIndex);

        // Attach Video Data (Only cached)
        const results = await Promise.all(paginatedItems.map(async (problem) => {
            try {
                const videos = await getOrFetchVideo(problem.id, false); // FALSE = Do NOT live fetch
                return {
                    ...problem,
                    video: (videos && videos.length > 0) ? videos[0] : null
                };
            } catch (innerErr) {
                console.warn(`Failed to attach video for ${problem.id}:`, innerErr);
                return problem;
            }
        }));
        
        // Return Object with Metadata for Frontend "Load More"
        res.json({
            data: results,
            total: total,
            page: pageNum,
            limit: limitNum,
            hasMore: endIndex < total
        });
    } catch (err) {
        console.error('API/List Error:', err);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// Sync Endpoint
app.post('/api/sync/:username', async (req, res) => {
    const { username } = req.params;
    
    // LeetCode GraphQL Query
    const query = `
      query userData($username: String!, $limit: Int!) {
        matchedUser(username: $username) {
          username
          submissionCalendar
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
        recentAcSubmissionList(username: $username, limit: $limit) {
          id
          title
          titleSlug
          timestamp
        }
      }
    `;

    try {
        console.log(`[LeetCode Sync] Attempting sync for user: ${username}`);
        const response = await axios.post('https://leetcode.com/graphql', {
            query: query,
            variables: { username, limit: 20 }
        }, {
            headers: { 
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://leetcode.com/'
            }
        });

        // LeetCode returns errors in the body with status 200 sometimes
        if (response.data.errors) {
            console.warn(`[LeetCode Sync] LeetCode API returned errors for ${username}:`, response.data.errors[0].message);
            if (response.data.errors[0].message.includes("user does not exist")) {
                return res.status(404).json({ error: `LeetCode user '${username}' not found. Please check your username.` });
            }
        }

        if (!response.data.data || !response.data.data.matchedUser) {
             return res.status(404).json({ error: 'User not found or profile is private' });
        }

        const stats = response.data.data.matchedUser.submitStats.acSubmissionNum;
        const recent = response.data.data.recentAcSubmissionList || [];
        const calendar = response.data.data.matchedUser.submissionCalendar || "{}";

        // Transform Stats
        const solvedStats = {
            total: stats.find(s => s.difficulty === 'All')?.count || 0,
            easy: stats.find(s => s.difficulty === 'Easy')?.count || 0,
            medium: stats.find(s => s.difficulty === 'Medium')?.count || 0,
            hard: stats.find(s => s.difficulty === 'Hard')?.count || 0,
            calendar: calendar
        };

        console.log(`[LeetCode Sync] SUCCESS for ${username}: ${solvedStats.total} solved`);

        res.json({
            solvedStats,
            recentSolved: recent
        });

    } catch (err) {
        console.error('[LeetCode Sync] Server Error:', err.message);
        res.status(500).json({ error: 'Failed to sync with LeetCode', details: err.message });
    }
});
// Company Plan Endpoint
app.get('/api/company/:name/plan', async (req, res) => {
    try {
        const companyName = req.params.name.toLowerCase();
        const plan = companyPlans[companyName];

        if (!plan) {
            return res.status(404).json({ error: 'Company plan not found' });
        }

        // Deep copy to avoid mutating cache
        const enrichedPlan = JSON.parse(JSON.stringify(plan));

        // Enriched DSA IDs with full video/problem objects
        const levels = Object.keys(enrichedPlan);
        
        for (const level of levels) {
            const levelData = enrichedPlan[level];
            if (levelData.dsa_ids && levelData.dsa_ids.length > 0) {
                const problems = await Promise.all(levelData.dsa_ids.map(async (id) => {
                    // Find problem details from problemsDb
                    const problemDetails = problemsDb.find(p => p.id === id.toString()) || { id, title: `Problem ${id}`, difficulty: 'Unknown' };
                    
                    // Fetch video
                    const videos = await getOrFetchVideo(id, false); 
                    
                    return {
                        ...problemDetails,
                        video: (videos && videos.length > 0) ? videos[0] : null
                    };
                }));
                levelData.problems = problems; // Attach enriched array
            } else {
                levelData.problems = [];
            }
        }

        res.json({ company: companyName, plan: enrichedPlan });

    } catch (err) {
        console.error("Company Plan API Error:", err);
        res.status(500).json({ error: 'Failed to fetch company plan' });
    }
});

// Daily Challenge Endpoint
app.get('/api/daily-challenge', async (req, res) => {
    try {
        if (!problemsDb || problemsDb.length === 0) {
            return res.status(503).json({ error: 'Problems database not loaded' });
        }

        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        const index = seed % problemsDb.length;
        const problem = problemsDb[index];
        const videos = await getOrFetchVideo(problem.id, false); 
        
        res.json({
            ...problem,
            video: (videos && videos.length > 0) ? videos[0] : null
        });

    } catch (err) {
        console.error("Daily Challenge Error:", err);
        res.status(500).json({ error: 'Failed to generate daily challenge' });
    }
});




// ---------------------------------------------
// AI Solution Generator + MongoDB Persistence
// ---------------------------------------------
const { GoogleGenerativeAI } = require("@google/generative-ai");
// File Cache Fallback (Legacy/Dev)
const SOLUTIONS_DIR = path.join(__dirname, 'data', 'solutions');
if (!fs.existsSync(SOLUTIONS_DIR)) {
    try { fs.mkdirSync(SOLUTIONS_DIR, { recursive: true }); } catch (e) {}
}

console.log("Checking GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "FOUND (starts with AIza)" : "MISSING");
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
console.log("AI Service Status:", genAI ? "INITIALIZED" : "DISABLED (Check .env)");

// Connect to MongoDB
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    if (!process.env.MONGODB_URI) {
        console.warn("MONGODB_URI not set. Using File System cache only (Not persistent on Vercel).");
        return;
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB Connected");
    } catch (err) {
        console.error("MongoDB Connection Error:", err);
    }
};

// Define Solution Schema
const solutionSchema = new mongoose.Schema({
    questionId: { type: String, required: true, unique: true },
    title: String,
    difficulty: String,
    topics: Array,
    problemStatement: String,
    analyticalOverview: String,
    examples: Array,
    complexityTable: Array,
    approaches: Array,
    createdAt: { type: Date, default: Date.now }
});

// Define Article Schema for Tech News
const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    summary: String,
    content: String,
    category: String,
    publishedDate: { type: Date, default: Date.now },
    source: String,
    originalLink: String,
    createdAt: { type: Date, default: Date.now }
});

// Get Models
const Solution = mongoose.models.Solution || mongoose.model('Solution', solutionSchema);
const Article = mongoose.models.Article || mongoose.model('Article', articleSchema);

app.get('/api/solution/:questionId', async (req, res) => {
    try {
        const { questionId } = req.params;
        await connectDB();

        // 1. Check MongoDB (Primary Persistent Storage)
        if (mongoose.connection.readyState === 1) {
            try {
                const dbSolution = await Solution.findOne({ questionId });
                if (dbSolution && dbSolution.approaches && dbSolution.approaches.length > 0) {
                    console.log(`Solution DB HIT for ${questionId}`);
                    const problemEntry = problemsDb.find(p => p.id === questionId);
                    
                    // Fetch Video
                    const videos = await getOrFetchVideo(questionId);
                    const topVideo = videos.find(v => v.isMostAccurate) || videos[0];

                    return res.json({ 
                        ...dbSolution.toObject(), 
                        slug: problemEntry ? problemEntry.slug : null,
                        video: topVideo,
                        source: 'database' 
                    });
                } else if (dbSolution) {
                    console.warn(`DB HIT for ${questionId} but data incomplete (empty approaches). Regenerating...`);
                }
            } catch (dbErr) {
                console.error("DB Read Error:", dbErr);
            }
        }

        // 2. Check File Cache (Fallback / Local Dev)
        const solutionPath = path.join(SOLUTIONS_DIR, `${questionId}.json`);
        if (fs.existsSync(solutionPath)) {
            try {
                const cachedData = JSON.parse(fs.readFileSync(solutionPath, 'utf8'));
                
                // VALIDATE CONTENT
                if (!cachedData.approaches || cachedData.approaches.length === 0) {
                     console.warn(`File Cache for ${questionId} is empty/invalid. Skipping.`);
                } else {
                    // DATA MIGRATION: If found in File but not in DB, save to DB now!
                    if (mongoose.connection.readyState === 1) {
                        try {
                            const exists = await Solution.exists({ questionId });
                            if (!exists) {
                                await Solution.create({
                                    questionId: questionId,
                                    ...cachedData
                                });
                                console.log(`Migrated ${questionId} from File to MongoDB`);
                            }
                        } catch (migErr) {
                             console.warn("Migration error:", migErr.message);
                        }
                    }
                    
                    const problemEntry = problemsDb.find(p => p.id === questionId);
                    
                    // Fetch Video
                    const videos = await getOrFetchVideo(questionId);
                    const topVideo = videos.find(v => v.isMostAccurate) || videos[0];

                    return res.json({ 
                        ...cachedData, 
                        slug: problemEntry ? problemEntry.slug : null,
                        video: topVideo,
                        source: 'local_file_cache_migrated' 
                    });
                }
            } catch (err) { console.error('File Cache Read Error:', err); }
        }

        // 3. Generate with AI
        if (!genAI) {
            return res.status(503).json({ error: "AI Service Unavailable (Key missing)" });
        }

        console.log(`Generating Solution for ${questionId}...`);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `
        You are an expert DSA coding tutor. Generate a premium, concise solution guide for LeetCode question "${questionId}".
        Follow the structure of a professional technical article similar to premium platforms like NeetCode or LeetCode Editorial.

        Required JSON Structure:
        {
          "questionId": "${questionId}",
          "title": "Problem Title",
          "difficulty": "Easy, Medium, or Hard",
          "topics": ["Topic", "Topic"],
          "problemStatement": "Clear, concise problem description.",

          "approaches": [
             {
               "name": "Brute Force",
               "concept": "1-2 sentence high-level idea.",
               "steps": ["Step 1", "Step 2"],
               "complexity": { "time": "O(...)", "space": "O(...)" },
               "codes": { "python": "...", "javascript": "...", "cpp": "...", "java": "..." }
             },
             {
               "name": "Better Approach",
               "concept": "1-2 sentence optimization insight.",
               "steps": ["Step 1", "Step 2"],
               "complexity": { "time": "O(...)", "space": "O(...)" },
               "codes": { "python": "...", "javascript": "...", "cpp": "...", "java": "..." }
             },
             {
               "name": "Optimal Solution",
               "concept": "1-2 sentence breakthrough logic.",
               "steps": ["Step 1", "Step 2"],
               "complexity": { "time": "O(...)", "space": "O(...)" },
               "codes": { "python": "...", "javascript": "...", "cpp": "...", "java": "..." }
             }
          ]
        }

        Rules:
        1. Return ONLY valid JSON.
        2. Provide exactly these 3 approaches: "Brute Force", "Better Approach", and "Optimal Solution".
        3. No "analyticalOverview" or "complexityTable" fields.
        4. "complexity" fields (time, space) must ONLY contain Big O notation (e.g., "O(N)") with NO DESCRIPTIVE TEXT.
        5. "concept" and "steps" should be punchy and clear.
        6. Tone: Professional, pedagogical, and concise. Avoid fluff.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

        let jsonResponse;
        try {
            jsonResponse = JSON.parse(text);
        } catch (e1) {
            try {
                const JSON5 = require('json5'); 
                jsonResponse = JSON5.parse(text);
            } catch (e2) {
                 return res.status(500).json({ error: "AI generated invalid JSON" });
            }
        }
 
        // 4. Save to MongoDB
        let dbStatus = "skipped";
        if (jsonResponse && (jsonResponse.approaches || jsonResponse.solutions)) {
            // Save to DB
            try {
                await Solution.create({
                    questionId: questionId,
                    ...jsonResponse
                });
                console.log(`Saved ${questionId} to MongoDB`);
                dbStatus = "success";
            } catch (saveErr) {
                // Ignore duplicate key error safely
                if (saveErr.code === 11000) {
                    dbStatus = "duplicate_skipped";
                } else {
                    console.error("DB Save Error:", saveErr);
                    dbStatus = `error: ${saveErr.message}`;
                }
            }

            // Save to File (Local Backup)
            try {
                if (process.env.NODE_ENV !== 'production') {
                    fs.writeFileSync(solutionPath, JSON.stringify(jsonResponse, null, 2));
                }
            } catch (e) {}
        } else {
             return res.status(500).json({ error: "Incomplete AI Data" });
        }

        // 5. Enrich with slug and video
        const problemEntry = problemsDb.find(p => p.id === questionId);
        
        // Fetch Video
        const videos = await getOrFetchVideo(questionId);
        const topVideo = videos.find(v => v.isMostAccurate) || videos[0];

        const enrichedResponse = { 
            ...jsonResponse, 
            slug: problemEntry ? problemEntry.slug : null,
            video: topVideo,
            source: 'ai-generated', 
            dbStatus: dbStatus 
        };

        return res.json(enrichedResponse);

        return res.json({ ...jsonResponse, source: 'ai_generated' });

    } catch (err) {
        console.error("Solution API Error:", err);
        return res.status(500).json({ error: "Server Error", details: err.message });
    }
});

// Company-Wise Questions API (Paginated & Searchable)
app.get('/api/companies', async (req, res) => {
    try {
        await connectDB();
        // Get unique companies and their counts
        const companies = await CompanyQuestion.aggregate([
            { $group: { _id: "$company", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        res.json(companies.map(c => ({ name: c._id, count: c.count })));
    } catch (err) {
        console.error("Fetch Companies Error:", err);
        res.status(500).json({ error: 'Failed to fetch companies' });
    }
});

// Company Questions
app.get('/api/company/:name/questions', async (req, res) => {
    try {
        const { name } = req.params;
        const { page = 1, limit = 50, sort = 'frequency', order = 'desc', search = '', difficulty = '' } = req.query;
        
        // Access Control Logic
        let hasAccess = false;
        const token = req.cookies.jwt; // Corrected from 'token' to 'jwt'
        if (token) {
            try {
                const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_keep_it_safe';
                const decoded = jwt.verify(token, JWT_SECRET);
                const purchase = await Purchase.findOne({
                    userId: decoded.id, // Corrected from 'userId' to 'id'
                    companies: name
                });
                if (purchase) hasAccess = true;
            } catch (err) {
                // Token invalid or expired, proceed as guest
            }
        }

        const query = { company: name };
        if (search) query.title = { $regex: search, $options: 'i' };
        if (difficulty) query.difficulty = difficulty;

        const skip = (page - 1) * limit;
        const sortObj = {};
        sortObj[sort] = order === 'desc' ? -1 : 1;

        const total = await CompanyQuestion.countDocuments(query);
        let questions = await CompanyQuestion.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(parseInt(limit));

        // If no access, only show top 40% of the total questions
        if (!hasAccess) {
            const limitCount = Math.ceil(total * 0.4);
            const allQuestions = await CompanyQuestion.find(query).sort(sortObj);
            const accessibleQuestions = allQuestions.slice(0, limitCount);
            
            // Mark non-accessible ones as locked
            questions = questions.map(q => {
                const isAccessible = accessibleQuestions.some(aq => aq._id.toString() === q._id.toString());
                if (!isAccessible) {
                    return {
                        ...q._doc,
                        isLocked: true,
                        // Strip sensitive info if needed
                        leetcodeUrl: '#',
                        frequency: 0
                    };
                }
                return { ...q._doc, isLocked: false };
            });
        } else {
            questions = questions.map(q => ({ ...q._doc, isLocked: false }));
        }

        res.json({
            questions,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page),
            hasAccess
        });
    } catch (err) {
        console.error('Company Questions Error:', err);
        res.status(500).json({ error: 'Failed to fetch company questions' });
    }
});

app.get('/api/company/:name/plan', async (req, res) => {
    try {
        const companyName = req.params.name.toLowerCase();
        const plan = companyPlans[companyName];

        if (!plan) {
            return res.status(404).json({ error: 'Company plan not found' });
        }

        // Deep copy to avoid mutating cache
        const enrichedPlan = JSON.parse(JSON.stringify(plan));

        // Enriched DSA IDs with full video/problem objects
        const levels = Object.keys(enrichedPlan);
        
        for (const level of levels) {
            const levelData = enrichedPlan[level];
            if (levelData.dsa_ids && levelData.dsa_ids.length > 0) {
                const problems = await Promise.all(levelData.dsa_ids.map(async (id) => {
                    // Find problem details from problemsDb
                    const problemDetails = problemsDb.find(p => p.id === id) || { id, title: `Problem ${id}`, difficulty: 'Unknown' };
                    
                    // Fetch video
                    const videos = await getOrFetchVideo(id, false); 
                    
                    return {
                        ...problemDetails,
                        video: (videos && videos.length > 0) ? videos[0] : null
                    };
                }));
                levelData.problems = problems; // Attach enriched array
            } else {
                levelData.problems = [];
            }
        }

        res.json({ company: companyName, plan: enrichedPlan });

    } catch (err) {
        console.error("Company Plan API Error:", err);
        res.status(500).json({ error: 'Failed to fetch company plan' });
    }
});

// Company Endpoint
app.get('/api/company/:companyName', async (req, res) => {
    const { companyName } = req.params;
    const key = companyName.toLowerCase();
    
    // Lazy load here in case we missed it at top, simplified
    let localCompanies = companiesDb;
    if (Object.keys(localCompanies).length === 0) {
        try {
            localCompanies = require('./data/companies.json');
        } catch(e) {}
    }

    if (!localCompanies[key]) {
        return res.status(404).json({ error: 'Company not found' });
    }

    const companyData = localCompanies[key];
    const results = [];
    const processedIds = new Set(); // Avoid dupes if same ID in both lists by mistake

    // Helper to process list
    const processList = async (idList, type, companyTitle) => {
        for (const id of idList) {
            if (processedIds.has(id)) continue;
            
            // Find problem in DB
            // Problem DB uses string "1" or number 1? Our JSON has "1".
            const problem = problemsDb.find(p => p.id === id.toString());
            
            if (problem) {
                processedIds.add(id);
                // Fetch video status (cached)
                const videos = await getOrFetchVideo(problem.id, false);
                
                results.push({
                    ...problem,
                    video: (videos && videos.length > 0) ? videos[0] : null,
                    companyStatus: {
                        type: type, // 'asked' or 'similar'
                        company: companyTitle
                    }
                });
            }
        }
    };

    // Process lists
    // Note: We run sequentially or parallel. 
    const title = companyName.charAt(0).toUpperCase() + companyName.slice(1);
    await processList(companyData.asked || [], 'asked', title);
    await processList(companyData.similar || [], 'similar', title);

    res.json(results);
});

// Survey API
app.post('/api/survey', async (req, res) => {
    try {
        await connectDB();
        const { response, pricePoint, userId } = req.body;
        
        if (!response) {
            return res.status(400).json({ error: 'Response is required' });
        }

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        
        // Basic deduplication check (relaxed for testing - 5 minutes)
        const recentResponse = await SurveyResponse.findOne({
            ip: ip,
            createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) } // Within last 5 minutes
        });

        if (recentResponse) {
            return res.status(429).json({ error: 'Survey already submitted recently' });
        }

        const surveyData = {
            response,
            pricePoint: pricePoint || "N/A",
            userId: userId || "guest",
            ip: ip,
            userAgent: req.headers['user-agent']
        };

        const newResponse = await SurveyResponse.create(surveyData);
        res.status(201).json({ message: 'Survey response saved', id: newResponse._id });
    } catch (err) {
        console.error("Survey Submission Error:", err);
        res.status(500).json({ error: 'Failed to submit survey' });
    }
});

// Survey Stats (Internal/Admin)
app.get('/api/survey/stats', async (req, res) => {
    try {
        await connectDB();
        
        // Count distribution of responses
        const distribution = await SurveyResponse.aggregate([
            { $group: { _id: "$response", count: { $sum: 1 } } }
        ]);

        // Count distribution of price points for "Yes"
        const pricing = await SurveyResponse.aggregate([
            { $match: { response: "Yes" } },
            { $group: { _id: "$pricePoint", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const total = await SurveyResponse.countDocuments();
        
        // Get recent responses
        const recent = await SurveyResponse.find()
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            total,
            distribution,
            pricing,
            recent
        });
    } catch (err) {
        console.error("Survey Stats Error:", err);
        res.status(500).json({ error: 'Failed to fetch survey stats' });
    }
});

// Articles APIs
app.get('/api/articles', async (req, res) => {
    try {
        await connectDB();
        const { category, limit = 10, skip = 0 } = req.query;
        
        const query = category ? { category } : {};
        const articles = await Article.find(query)
            .sort({ publishedDate: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));
            
        res.json(articles);
    } catch (err) {
        console.error("Fetch Articles Error:", err);
        res.status(500).json({ error: 'Failed to fetch articles' });
    }
});

app.get('/api/articles/:slug', async (req, res) => {
    try {
        await connectDB();
        const { slug } = req.params;
        const article = await Article.findOne({ slug });
        
        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }
        
        res.json(article);
    } catch (err) {
        console.error("Fetch Article Detail Error:", err);
        res.status(500).json({ error: 'Failed to fetch article details' });
    }
});

// Daily Challenge API
app.get('/api/daily-challenge', (req, res) => {
    try {
        if (!problemsDb || problemsDb.length === 0) {
            return res.status(500).json({ error: 'Problems database not loaded' });
        }

        // Use a deterministic index based on the current date
        const today = new Date();
        const startOfYear = new Date(today.getUTCFullYear(), 0, 0);
        const diff = today - startOfYear;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        // Pick problem based on day of year
        const index = dayOfYear % problemsDb.length;
        const dailyProblem = problemsDb[index];

        res.json(dailyProblem);
    } catch (err) {
        console.error("Daily Challenge API Error:", err);
        res.status(500).json({ error: 'Failed to fetch daily challenge' });
    }
});

// Automated News Sync (Background Task)
const cron = require('node-cron');
const { sync: syncNews } = require('./scripts/sync_news');

// Schedule news sync to run every day at 00:00 (Midnight)
cron.schedule('0 0 * * *', async () => {
    console.log('Automated News Sync started (Cron Task)...');
    try {
        await syncNews(false); // false = don't close the primary server connection
        console.log('Automated News Sync completed.');
    } catch (err) {
        console.error('Automated News Sync failed:', err.message);
    }
});

// Start Server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Keep process alive (deployment/environment fix)
setInterval(() => {}, 60000);

// --- Universal Problem Explanation System ---

// API: Resolve Problem (Entry point for Extension)
app.post('/api/resolve-problem', async (req, res) => {
    const { title, platform, url } = req.body;
    if (!title || !platform || !url) {
        return res.status(400).json({ error: "Missing required fields: title, platform, url" });
    }

    try {
        await connectDB();
        const slug = slugify(title, { lower: true, strict: true });

        // 1. Try exact match in problems
        let problem = await UniversalProblem.findOne({ platform, slug }).populate('concept_id');

        if (problem) {
            const conceptId = problem.concept_id._id || problem.concept_id;
            let explanation = await Explanation.findOne({ concept_id: conceptId });
            let finalVideos = (explanation && explanation.video_links) ? explanation.video_links : [];
            
            // Auto-fetch videos if missing
            const needsFetch = explanation && (!explanation.video_links || explanation.video_links.length === 0);
            if (needsFetch) {
                console.log(`Auto-fetching videos for: ${title}`);
                const fetchedVideos = await getOrFetchUniversalVideos(title, conceptId);
                finalVideos = fetchedVideos;
            }

            return res.json({
                status: 'found',
                problem,
                explanation: explanation ? { ...explanation.toObject(), video_links: finalVideos } : null,
                concept: problem.concept_id
            });
        }

        // 2. If not found, look for ANY problem with same normalized title to reuse concept
        const conceptKey = normalizeConceptKey(title);
        let existingConcept = await Concept.findOne({ concept_key: conceptKey });

        if (existingConcept) {
            // Create problem mapping for this platform
            problem = await UniversalProblem.create({
                platform,
                title,
                slug,
                url,
                concept_id: existingConcept._id
            });
            let explanation = await Explanation.findOne({ concept_id: existingConcept._id });

            // Auto-fetch videos if missing
            if (explanation && (!explanation.video_links || explanation.video_links.length === 0)) {
                console.log(`Auto-fetching videos for: ${title} (mapped concept)`);
                await getOrFetchUniversalVideos(title, existingConcept._id);
                explanation = await Explanation.findOne({ concept_id: existingConcept._id });
            }

            return res.json({
                status: 'mapped',
                problem,
                explanation,
                concept: existingConcept
            });
        }

        // 3. New Concept: Trigger Generation
        return res.json({ 
            status: 'pending', 
            message: "Concept not found. Please trigger generation.",
            canGenerate: true,
            title,
            platform,
            url
        });
    } catch (err) {
        console.error("Resolve Error:", err.message);
        if (err.status === 429) {
            return res.status(429).json({ 
                error: "Intelligence Layer over-clocked. Please wait 60 seconds.",
                code: "RATE_LIMIT_EXCEEDED"
            });
        }
        res.status(500).json({ error: "System Error", details: err.message });
    }
});

// API: Generate Concept & Explanation
// Helper: Get or Generate Concept & Explanation
async function getOrGenerateConcept(title, platform = null, url = null) {
    const conceptKey = normalizeConceptKey(title);
    let concept = await Concept.findOne({ concept_key: conceptKey });

    if (!concept) {
        if (!genAI) throw new Error("AI Service Unavailable (genAI is null)");
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const prompt = `
        You are an expert DSA coding tutor. Generate a premium, concise solution guide for the coding problem titled: "${title}" from platform: "${platform || 'General'}".
        Follow the structure of a high-end technical publication (similar to NeetCode or LeetCode Premium).
        
        Return ONLY a JSON object:
        {
          "concept_key": "${conceptKey}",
          "topic": "Main Topic (e.g. String, DP, Graph, Recursion)",
          "pattern": "Specific Pattern (e.g. Sliding Window, Monotonic Stack)",
          "difficulty_estimate": "Easy, Medium, or Hard",
          "source_url": "The official GeeksforGeeks practice URL following the format: https://www.geeksforgeeks.org/problems/[slug]/1",
          "explanation": {
            "analytical_overview": "Deep technical overview of the problem's nature. Write in clear, short, distinct sentences. Do NOT use long run-on sentences.",

            "complexity_table": [
                { "method": "Brute Force", "time": "O(...)", "space": "O(...)" },
                { "method": "Optimal", "time": "O(...)", "space": "O(...)" }
            ],
            "approaches": [
              {
                "name": "Brute Force Approach",
                "concept": "High-level idea (1-2 sentences).",
                "steps": ["Step 1", "Step 2"],
                "complexity": { "time": "O(...)", "space": "O(...)" },
                "codes": { "python": "...", "javascript": "...", "cpp": "...", "java": "..." }
              },
              {
                "name": "Optimal Approach",
                "concept": "Optimization insight (1-2 sentences).",
                "steps": ["Step 1", "Step 2"],
                "complexity": { "time": "O(...)", "space": "O(...)" },
                "codes": { "python": "...", "javascript": "...", "cpp": "...", "java": "..." }
              }
            ],
            "common_mistakes": ["Pitfall 1", "Pitfall 2"]
          }
        }
        
        RULES:
        1. "difficulty_estimate" must be exactly "Easy", "Medium", or "Hard".
        2. "complexity" fields must only contain Big O (e.g. O(N)).
        3. Provide exactly 2 or 3 approaches.
        4. Tone: Professional, pedagogical, and concise. Avoid fluff.
        5. For GeeksforGeeks, the "source_url" SHOULD be in the format: https://www.geeksforgeeks.org/problems/[slug]/1
        `;

        let result;
        try {
            result = await model.generateContent(prompt);
        } catch (genErr) {
            console.error("AI Generation Critical Error:", genErr.message);
            if (genErr.status === 429 || genErr.message?.includes('429')) {
                const limitErr = new Error("AI Quotient Exhausted");
                limitErr.status = 429;
                throw limitErr;
            }
            throw genErr;
        }

        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (jErr) {
            try {
                // Attempt to clean up common AI mistakes
                const cleanedText = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
                data = JSON.parse(cleanedText);
            } catch (jErr2) {
                console.error("AI JSON Parse Error:", jErr2.message);
                throw new Error("AI generated invalid JSON structure.");
            }
        }

        // Normalize difficulty
        let normalizedDifficulty = 'Easy';
        const rawDiff = (data.difficulty_estimate || 'Easy').toLowerCase();
        if (rawDiff.includes('hard')) normalizedDifficulty = 'Hard';
        else if (rawDiff.includes('medium')) normalizedDifficulty = 'Medium';

        // Create Concept (Handle Race Condition)
        try {
            concept = await Concept.create({
                concept_key: data.concept_key,
                topic: data.topic,
                pattern: data.pattern,
                difficulty_estimate: normalizedDifficulty
            });

            // Create Explanation only if Concept creation succeeded (we are the winner)
            await Explanation.create({
                concept_id: concept._id,
                analytical_overview: data.explanation.analytical_overview,
                complexity_table: data.explanation.complexity_table,
                approaches: data.explanation.approaches,
                step_by_step: data.explanation.step_by_step || [],
                common_mistakes: data.explanation.common_mistakes || [],
                ai_generated: true
            });

            // Trigger video fetch (background)
            getOrFetchUniversalVideos(title, concept._id).catch(err => console.error("Background Video Fetch Error:", err));

        } catch (dbErr) {
            if (dbErr.code === 11000) {
                console.log(`[Race Condition Detected] Concept '${data.concept_key}' already created. Fetching existing...`);
                concept = await Concept.findOne({ concept_key: data.concept_key });
                if (!concept) throw new Error("Race condition handled but concept still missing.");
            } else {
                throw dbErr;
            }
        }


    }

    // Sync UniversalProblem mapping if provided
    if (platform) {
        let finalUrl = url || data.source_url;
        const slug = slugify(title).toLowerCase();

        // For GFG, ensure we use the provided URL if it exists and is valid, otherwise fallback
        if (platform === 'geeksforgeeks') {
            const rawUrl = url || data.source_url || '';
            if (rawUrl.includes('geeksforgeeks.org')) {
                finalUrl = rawUrl; // Trust the source/DB URL first
            } else {
                finalUrl = `https://www.geeksforgeeks.org/problems/${slug}/1`;
            }
        }

        if (finalUrl) {
            await UniversalProblem.findOneAndUpdate(
                { platform, slug },
                { concept_id: concept._id, title, url: finalUrl },
                { upsert: true }
            );
        }
    }

    const explanation = await Explanation.findOne({ concept_id: concept._id });
    const relatedProblems = await UniversalProblem.find({ concept_id: concept._id });

    return { concept, explanation, relatedProblems };
}

// API: Generate Concept & Explanation
app.post('/api/generate-concept', async (req, res) => {
    const { title, platform, url } = req.body;
    if (!title) return res.status(400).json({ error: "Title required" });

    try {
        await connectDB();
        const result = await getOrGenerateConcept(title, platform, url);
        res.json(result);
    } catch (err) {
        console.error("Generation Error:", err.message);
        if (err.status === 429) {
            return res.status(429).json({ 
                error: "Intelligence Layer over-clocked. Please wait 60 seconds.",
                code: "RATE_LIMIT_EXCEEDED"
            });
        }
        res.status(500).json({ error: "AI Generation Failed", details: err.message });
    }
});

// API: Universal Problem Resolver (Lazy Load)
app.get('/api/universe/resolve/:platform/:slug', async (req, res) => {
    const { platform, slug } = req.params;
    try {
        await connectDB();
        
        let problem = await UniversalProblem.findOne({ platform, slug });
        
        if (!problem) {
            return res.status(404).json({ error: "Problem not trackable in this star sector." });
        }

        // Use helper to find or generate
        console.log(`[Universe Resolve] Processing: ${platform}/${slug} (${problem.title})`);
        const result = await getOrGenerateConcept(problem.title, platform, problem.url);
        console.log(`[Universe Resolve] Success for: ${slug}`);
        res.json(result);

    } catch (err) {
        console.error("Resolve Error:", err.message);
        if (err.status === 429) {
            return res.status(429).json({ 
                error: "Intelligence Layer over-clocked. Please try again in 30-60 seconds.",
                code: "RATE_LIMIT_EXCEEDED"
            });
        }
        res.status(500).json({ 
            error: "System encountered an error during inference.",
            details: err.message,
            stack: err.stack
        });
    }
});

// API: Bulk skeletal seed
app.post('/api/universe/bulk-seed', async (req, res) => {
    const { problems, platform } = req.body;
    if (!problems || !Array.isArray(problems)) return res.status(400).json({ error: "Problems array required" });

    try {
        await connectDB();
        const results = { created: 0, skipped: 0, errors: 0 };

        for (const title of problems) {
            try {
                const slug = slugify(title, { lower: true, strict: true });
                const url = `https://www.geeksforgeeks.org/problems/${slug}/1`;
                
                const existing = await UniversalProblem.findOne({ platform, slug });
                if (!existing) {
                    await UniversalProblem.create({ platform, title, slug, url });
                    results.created++;
                } else {
                    results.skipped++;
                }
            } catch (pErr) {
                results.errors++;
            }
        }
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API: Get Concept Details
app.get('/api/concept/:id', async (req, res) => {
    try {
        await connectDB();
        const concept = await Concept.findById(req.params.id);
        if (!concept) return res.status(404).json({ error: "Concept not found" });

        // --- Auto-Linker Logic ---
        // 1. Derive potential slugs/titles from concept_key
        const normalizedKey = concept.concept_key.toLowerCase();
        const potentialSlug = slugify(concept.concept_key, { lower: true, strict: true });
        
        // 2. Find orphans that match this concept
        // We look for problems with NO concept_id that match the slug pattern
        await UniversalProblem.updateMany(
            {
                concept_id: { $exists: false },
                $or: [
                    { slug: potentialSlug },
                    { title: { $regex: new RegExp(`^${concept.concept_key}$`, 'i') } } // Case-insensitive exact title match
                ]
            },
            { $set: { concept_id: concept._id } }
        );
        // -------------------------

        const explanation = await Explanation.findOne({ concept_id: concept._id });
        const relatedProblems = await UniversalProblem.find({ concept_id: concept._id });

        res.json({
            concept,
            explanation,
            relatedProblems
        });
    } catch (err) {
        console.error("Fetch Concept Error:", err);
        res.status(500).json({ error: "Fetch error" });
    }
});

// API: Get Topic Statistics for a Platform
app.get('/api/universal-problems/topics', async (req, res) => {
    try {
        await connectDB();
        const { platform } = req.query;
        if (!platform) return res.status(400).json({ error: "Platform required" });

        const stats = await UniversalProblem.aggregate([
            { $match: { platform } },
            { $unwind: "$tags" },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const topics = stats.map(s => ({ tag: s._id, count: s.count }));
        res.json(topics);
    } catch (err) {
        console.error("Fetch Topics Error:", err);
        res.status(500).json({ error: "Fetch error" });
    }
});

// API: Get All Universal Problems (for Explore page)
app.get('/api/universal-problems', async (req, res) => {
    try {
        await connectDB();
        const { platform, page = 1, limit = 30, tag, search } = req.query;
        let query = {};

        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { title: { $regex: searchRegex } },
                { slug: { $regex: searchRegex } }
            ];
        }

        
        if (platform && platform !== 'all') {
            query.platform = platform;
        }

        if (tag) {
            query.tags = tag;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const problems = await UniversalProblem.find(query)
            .populate('concept_id')
            .sort({ last_seen_at: -1 }) // Ensure consistent sort order
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await UniversalProblem.countDocuments(query);

        res.json({
            problems,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error("Fetch Universal Problems Error:", err);
        res.status(500).json({ error: "Fetch error" });
    }
});

module.exports = app;
