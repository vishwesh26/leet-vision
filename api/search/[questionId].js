const { getOrFetchVideo } = require('../../_lib/youtube');

// Endpoint: /api/search/[questionId]
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { questionId } = req.query;

    if (!questionId) {
        return res.status(400).json({ error: 'Question ID required' });
    }

    try {
        // Search Endpoint (Manual - Always Fetch)
        const videos = await getOrFetchVideo(questionId, true); // Force fetch
        
        if (videos && videos.length > 0) {
            return res.json(videos); 
        }

        return res.status(404).json({ error: 'No video found' });
    } catch (err) {
        console.error('API/Search Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
