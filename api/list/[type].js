const { problemsDb } = require('../_lib/db');
const { getOrFetchVideo } = require('../_lib/youtube');

// Endpoint: /api/list/[type]
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { type } = req.query; // Vercel injects path params into req.query
        const { difficulty, param } = req.query; 

        // Important: req.query includes both path params (type) and query string params (difficulty, param)

        let filtered = [];
        let db = problemsDb;
        if (!Array.isArray(db)) db = [];

        if (type === 'top-100') {
            filtered = db.slice(0, 100);
        } else if (type === 'blind-75') {
            filtered = db.slice(0, 75); 
        } else if (type === 'difficulty') {
            if (!difficulty) return res.json([]); 
            filtered = db.filter(p => p.difficulty === difficulty);
        } else if (type === 'topic') {
            const topic = param || difficulty;
            if (!topic) return res.json([]);
            filtered = db.filter(p => p.topics.some(t => t.toLowerCase() === topic.toLowerCase()));
        } else if (type === 'company') {
            filtered = db.slice(0, 20);
        } else {
            // Default or unknown type just dumps list (limit 100)
            filtered = db;
        }

        filtered = filtered.slice(0, 100);

        // Attach Video Data
        const results = await Promise.all(filtered.map(async (problem) => {
            try {
                const videos = await getOrFetchVideo(problem.id, false); 
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
}
