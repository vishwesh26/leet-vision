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
        console.log(`Cache MISS for ${questionId} - Fetching API...`);
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
        const { difficulty, param } = req.query; // param can be topic, company

        let filtered = [];

        if (type === 'top-100') {
            // Just return first 100 of our DB for now
            filtered = problemsDb.slice(0, 100);
        } else if (type === 'blind-75') {
            // Assume our DB IS the curated list for now, or filter by specific IDs if we had a separate list
            filtered = problemsDb.slice(0, 75); 
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
            // Placeholder
            filtered = problemsDb.slice(0, 20);
        } else {
            filtered = problemsDb;
        }

        // Limit size to prevent massive payloads if something goes wrong
        filtered = filtered.slice(0, 100);

        // Attach Video Data (Only cached)
        const results = await Promise.all(filtered.map(async (problem) => {
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
        
        res.json(results);
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

// Define Schema
const solutionSchema = new mongoose.Schema({
    questionId: { type: String, required: true, unique: true },
    title: String,
    problemStatement: String,
    examples: Array,
    approaches: Array, // Stores the complex array of objects
    createdAt: { type: Date, default: Date.now }
});

// Get Model (prevent overwrite error during hot reload)
const Solution = mongoose.models.Solution || mongoose.model('Solution', solutionSchema);

app.get('/api/solution/:questionId', async (req, res) => {
    try {
        const { questionId } = req.params;
        await connectDB();

        // 1. Check MongoDB (Primary Persistent Storage)
        if (mongoose.connection.readyState === 1) {
            try {
                const dbSolution = await Solution.findOne({ questionId });
                if (dbSolution) {
                    console.log(`Solution DB HIT for ${questionId}`);
                    return res.json({ ...dbSolution.toObject(), source: 'database' });
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
                
                // DATA MIGRATION: If found in File but not in DB, save to DB now!
                if (mongoose.connection.readyState === 1) {
                    try {
                        // Check one more time or just upsert
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
                
                return res.json({ ...cachedData, source: 'local_file_cache_migrated' });
            } catch (err) { console.error('File Cache Read Error:', err); }
        }

        // 3. Generate with AI
        if (!genAI) {
            return res.status(503).json({ error: "AI Service Unavailable (Key missing)" });
        }

        console.log(`Generating Solution for ${questionId}...`);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash" });
        
        const prompt = `
        You are an expert DSA coding tutor. Generate a comprehensive solution guide for LeetCode question "${questionId}".
        
        Structure the response efficiently as a JSON object.
        
        Required JSON Structure:
        {
          "questionId": "${questionId}",
          "title": "Problem Title",
          "problemStatement": "Concise problem description...",
          "examples": [
             { "input": "...", "output": "...", "explanation": "..." }
          ],
          "approaches": [
             {
               "name": "Brute Force Approach",
               "algorithm": ["Step 1...", "Step 2..."],
               "complexity": {
                  "time": "O(...)",
                  "space": "O(...)"
               },
               "codes": {
                  "cpp": "...",
                  "java": "...",
                  "python": "...",
                  "javascript": "..."
               }
             },
             {
               "name": "Optimal Approach",
               "algorithm": ["Step 1...", "Step 2..."],
               "complexity": {
                  "time": "O(...)",
                  "space": "O(...)"
               },
               "codes": {
                  "cpp": "...",
                  "java": "...",
                  "python": "...",
                  "javascript": "..."
               }
             }
          ]
        }

        Rules:
        1. Return ONLY valid JSON. No markdown formatting.
        2. Provide at least "Brute Force" and "Optimal". If they are the same, just provide "Optimal".
        3. "algorithm" should be an array of strings (bullet points).
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

        return res.json({ 
            ...jsonResponse, 
            source: 'ai-generated', 
            dbStatus: dbStatus 
        });

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


// Vercel requires exporting the app
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
