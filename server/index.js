const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const NodeCache = require('node-cache');
const axios = require('axios');

dotenv.config();

const fs = require('fs');
const path = require('path');
const CompanyQuestion = require('./models/CompanyQuestion');
const StoredVideo = require('./models/StoredVideo');
const mongoose = require('mongoose');

const app = express();
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

app.use(cors());
app.use(express.json());

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

// Curated Top 100 Liked Questions List
const TOP_100_IDS = [
  1, 2, 3, 4, 5, 10, 11, 15, 17, 19, 20, 21, 22, 23, 31, 32, 33, 34, 35, 39,
  41, 42, 46, 48, 49, 53, 55, 56, 62, 64, 70, 72, 75, 76, 78, 79, 84, 85, 94, 96, 98,
  101, 102, 104, 105, 114, 121, 124, 128, 136, 139, 141, 142, 146, 148, 152, 155, 160, 169, 198,
  200, 206, 207, 208, 215, 221, 226, 234, 236, 238, 239, 240, 253, 279, 283, 287, 295, 297, 300, 
  301, 309, 322, 337, 338, 347, 394, 399, 406, 416, 437, 438, 448, 494, 543, 560, 581, 617, 647, 739
];

// Curated Blind 75 List
const BLIND_75_IDS = [
  1, 121, 217, 238, 15, 11, 153, 33, 3, 424, 76, 242, 49, 20, 125, 5, 647, 198, 213, 300, 322, 
  139, 1143, 62, 190, 191, 338, 268, 371, 54, 48, 73, 206, 21, 143, 19, 141, 23, 104, 100, 226, 
  102, 572, 98, 230, 235, 105, 211, 208, 252, 253, 435, 56, 57, 269, 200, 133, 417, 207, 210, 
  261, 323, 212, 79, 347, 39, 128, 295
];

// List Endpoint
app.get('/api/list/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { difficulty, param, page = 1, limit = 20 } = req.query;

        let filtered = [];
        
        // Ensure problemsDb is available
        if (!Array.isArray(problemsDb)) problemsDb = [];

        if (type === 'top-100') {
            // Strictly use the curated list
            filtered = problemsDb.filter(p => TOP_100_IDS.includes(parseInt(p.id)));
             // Ensure they are sorted by ID (Ascending)
            filtered.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        } else if (type === 'blind-75') {
            // Use Curated Blind 75 List (Fixed Sequence)
            filtered = problemsDb.filter(p => BLIND_75_IDS.includes(parseInt(p.id)));
            // Sort by order in BLIND_75_IDS
            filtered.sort((a, b) => {
                return BLIND_75_IDS.indexOf(parseInt(a.id)) - BLIND_75_IDS.indexOf(parseInt(b.id));
            });
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

        if (!response.data.data.matchedUser) {
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

        // Just return the raw list, let frontend handle deduplication
        res.json({
            solvedStats,
            recentSolved: recent
        });

    } catch (err) {
        console.error('LeetCode Sync Error:', err.message);
        res.status(500).json({ error: 'Failed to sync with LeetCode', details: err.message });
    }
});




// ---------------------------------------------
// AI Solution Generator + MongoDB Persistence
// ---------------------------------------------
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require('mongoose');

// File Cache Fallback (Legacy/Dev)
const SOLUTIONS_DIR = path.join(__dirname, 'data', 'solutions');
if (!fs.existsSync(SOLUTIONS_DIR)) {
    try { fs.mkdirSync(SOLUTIONS_DIR, { recursive: true }); } catch (e) {}
}

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

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
          "examples": [
             { "input": "...", "output": "...", "explanation": "Brief, clear explanation." }
          ],
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

// Helper to load companies data lazily or just read it here
let companiesDb = {};
try {
    const companiesData = fs.readFileSync(path.join(__dirname, 'data', 'companies.json'), 'utf8');
    companiesDb = JSON.parse(companiesData);
    console.log(`Loaded ${Object.keys(companiesDb).length} companies from database.`);
} catch (err) {
    console.error('Error loading companies.json:', err);
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

app.get('/api/company/:name/questions', async (req, res) => {
    try {
        await connectDB();
        const { name } = req.params;
        const { difficulty, topic, search, sort = 'frequency', order = 'desc', page = 1, limit = 50 } = req.query;

        const query = { company: new RegExp(`^${name}$`, 'i') };
        if (difficulty) query.difficulty = difficulty;
        if (topic) query.topics = topic;
        if (search) query.title = new RegExp(search, 'i');

        const sortObj = {};
        sortObj[sort] = order === 'asc' ? 1 : -1;

        const questions = await CompanyQuestion.find(query)
            .sort(sortObj)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await CompanyQuestion.countDocuments(query);

        res.json({
            questions,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error("Fetch Company Questions Error:", err);
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

module.exports = app;
