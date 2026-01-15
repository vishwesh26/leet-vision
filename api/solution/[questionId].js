const { getSolution } = require('../_lib/ai');

// Endpoint: /api/solution/[questionId]
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { questionId } = req.query; // Path param injected into query

    if (!questionId) {
        return res.status(400).json({ error: 'Question ID required' });
    }

    try {
        const result = await getSolution(questionId);
        return res.json(result);
    } catch (err) {
        console.error("Solution API Error:", err);
        
        const status = err.message.includes("not configured") ? 503 : 500;
        return res.status(status).json({ 
            error: "Failed to generate solution", 
            details: err.message 
        });
    }
}
