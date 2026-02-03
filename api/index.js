const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const NodeCache = require('node-cache');
const axios = require('axios');
const slugify = require('slugify');

dotenv.config();

const fs = require('fs');
const path = require('path');

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

app.use(cors({
    origin: ['https://leet-vision.vercel.app', 'http://localhost:5173', 'http://localhost:5000'],
    credentials: true
}));
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

// Load Company Plans
let companyPlans = {};
try {
    companyPlans = require('./data/company_plans.json');
    console.log(`Loaded plans for ${Object.keys(companyPlans).length} companies.`);
} catch (err) {
    console.error('Error loading company_plans.json:', err);
    companyPlans = {};
}

// Logo Proxy to avoid frontend 404s
app.get('/api/logo/:domain', async (req, res) => {
    const { domain } = req.params;
    try {
        const services = [
            `https://logo.clearbit.com/${domain}`,
            `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
            `https://icon.horse/icon/${domain}`
        ];
        
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
        res.status(404).json({ error: 'Logo not found' });
    } catch (err) {
        res.status(404).json({ error: 'Logo not found' });
    }
});


// Helper: Get or Fetch Video (Quota Efficient)
// fetchIfMissing: true = perform API call if cache miss. false = return null/empty if cache miss.
const getOrFetchVideo = async (questionId, fetchIfMissing = true) => {
    // 1. Check Cache
    if (videoCache[questionId]) {
        // console.log(`Cache HIT for ${questionId}`);
        // Handle legacy single-object cache (wrap in array)
        if (!Array.isArray(videoCache[questionId])) {
             return [videoCache[questionId]];
        }
        return videoCache[questionId];
    }

    // 2. Mock Logic if NO Key
    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
        const mockVideo = {
            id: 'Kl2u4R0OQVE', // Placeholder Valid Video (Two Sum)
            questionId: questionId,
            title: `[MOCK] Solution for ${questionId} (Add API Key for Real Data)`,
            channelTitle: 'Mock Channel',
            thumbnail: 'https://i.ytimg.com/vi/Kl2u4R0OQVE/hqdefault.jpg',
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
        const maskedKey = YOUTUBE_API_KEY ? `${YOUTUBE_API_KEY.substring(0, 4)}...` : 'NONE';
        console.log(`Cache MISS for ${questionId} - Fetching API... (Key: ${maskedKey})`);
        
        // Dynamic Query based on ID format
        const query = `LeetCode ${questionId} solution`;
        
        console.log(`Querying YouTube: "${query}"`);

        // Search - Fetch 5 results
        const searchRes = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
            params: { part: 'snippet', q: query, type: 'video', maxResults: 5, key: YOUTUBE_API_KEY }
        });

        if (!searchRes.data.items || searchRes.data.items.length === 0) {
            console.warn(`YouTube returned 0 results for query: "${query}" - FAILED. Returning MOCK.`);
            // FALLBACK TO PLAYABLE MOCK
            const mockVideo = {
                id: 'Kl2u4R0OQVE', 
                questionId: questionId,
                title: `[MOCK] Solution for ${questionId} (API Key Invalid or Quota Exceeded)`,
                channelTitle: 'Mock Channel',
                thumbnail: 'https://i.ytimg.com/vi/Kl2u4R0OQVE/hqdefault.jpg',
                viewCount: 1000,
                likeCount: 50,
                isMostAccurate: true,
                publishedAt: new Date().toISOString()
            };
            return [mockVideo];
        }

        const videoIds = searchRes.data.items.map(item => item.id.videoId).join(',');
        
        // Get Stats for all 5
        const statsRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
            params: { part: 'statistics,snippet', id: videoIds, key: YOUTUBE_API_KEY }
        });

        if (!statsRes.data.items || statsRes.data.items.length === 0) return []; // Should rarely happen if search succeeded

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
        if (e.response) {
            console.error('API Error Details:', e.response.data);
        }
        // FALLBACK TO PLAYABLE MOCK ON ERROR
        const mockVideo = {
            id: 'Kl2u4R0OQVE',
            questionId: questionId,
            title: `[MOCK] Solution for ${questionId} (API Key Invalid or Quota Exceeded)`,
            channelTitle: 'Mock Channel',
            thumbnail: 'https://i.ytimg.com/vi/Kl2u4R0OQVE/hqdefault.jpg',
            viewCount: 1000,
            likeCount: 50,
            isMostAccurate: true,
            publishedAt: new Date().toISOString()
        };
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

// Custom Lists
let blind75Ids = [];
let top100Ids = [];
try {
    blind75Ids = require('./data/blind75.json');
    top100Ids = require('./data/top100.json');
} catch (e) {
    console.error("Failed to load custom lists:", e.message);
}

// List Endpoint
app.get('/api/list/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const { difficulty, param } = req.query; // param can be topic, company

        let filtered = [];

        if (type === 'top-100') {
            // Filter DB by Top 100 IDs
            // We want to preserve the order of top100Ids
            filtered = top100Ids.map(id => problemsDb.find(p => p.id === id)).filter(Boolean);
            
        } else if (type === 'blind-75') {
             // Filter DB by Blind 75 IDs
            filtered = blind75Ids.map(id => problemsDb.find(p => p.id === id)).filter(Boolean);

        } else if (type === 'difficulty') {
            // Ensure problemsDb is an array before filtering
            if (!Array.isArray(problemsDb)) problemsDb = [];
            filtered = problemsDb.filter(p => p.difficulty === difficulty);

        } else if (type === 'topic') {
            const topic = param || difficulty; // Sometimes passed as param
            if (!topic) return res.json([]);
            if (!Array.isArray(problemsDb)) problemsDb = [];
            filtered = problemsDb.filter(p => p.topics.some(t => t.toLowerCase() === topic.toLowerCase()));

        } else if (type === 'company') {
            // Placeholder fallback
             filtered = problemsDb.slice(0, 20);
             
        } else {
            filtered = problemsDb;
        }

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        const paginatedData = filtered.slice(startIndex, endIndex);

        // Attach Video Data (Only cached)
        const results = await Promise.all(paginatedData.map(async (problem) => {
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
        
        // Return structured response
        res.json({
            data: results,
            total: filtered.length,
            page,
            totalPages: Math.ceil(filtered.length / limit),
            hasMore: endIndex < filtered.length
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

// Define Schema
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

const companyQuestionSchema = new mongoose.Schema({
    company: { type: String, required: true, index: true },
    title: { type: String, required: true },
    difficulty: { type: String, required: true },
    frequency: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 },
    topics: [String],
    leetcodeUrl: { type: String, required: true },
    questionId: { type: String, index: true }, 
    updatedAt: { type: Date, default: Date.now }
});

// Compound index for uniqueness (per company)
companyQuestionSchema.index({ company: 1, leetcodeUrl: 1 }, { unique: true });

// Get Models
const Solution = mongoose.models.Solution || mongoose.model('Solution', solutionSchema);
const Article = mongoose.models.Article || mongoose.model('Article', articleSchema);
const CompanyQuestion = mongoose.models.CompanyQuestion || mongoose.model('CompanyQuestion', companyQuestionSchema);

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
                    // Optional: await Solution.deleteOne({ _id: dbSolution._id });
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
                     // Force fallthrough to AI generation
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
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        
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
            // Save to DB (Upsert to overwrite potential bad/empty data)
            try {
                await Solution.findOneAndUpdate(
                    { questionId: questionId },
                    { 
                        questionId: questionId,
                        ...jsonResponse 
                    },
                    { upsert: true, new: true }
                );
                console.log(`Saved/Updated ${questionId} to MongoDB`);
                dbStatus = "success";
            } catch (saveErr) {
                console.error("DB Save Error:", saveErr);
                dbStatus = `error: ${saveErr.message}`;
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


// Vercel requires exporting the app
// Vercel requires exporting the app
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
