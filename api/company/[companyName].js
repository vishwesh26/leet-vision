const { problemsDb, companiesDb } = require('../_lib/db');
const { getOrFetchVideo } = require('../_lib/youtube');

// Endpoint: /api/company/[companyName]
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { companyName } = req.query;

    if (!companyName) {
        return res.status(400).json({ error: 'Company Name required' });
    }

    const key = companyName.toLowerCase();
    
    if (!companiesDb[key]) {
        return res.status(404).json({ error: 'Company not found' });
    }

    const companyData = companiesDb[key];
    const results = [];
    const processedIds = new Set(); 

    // Helper to process list
    const processList = async (idList, type, companyTitle) => {
        if (!Array.isArray(idList)) return;
        
        for (const id of idList) {
            if (processedIds.has(id)) continue;
            
            // problemsDb uses string ids? Check source. Assuming logic transfer is enough.
            const problem = problemsDb.find(p => p.id === id.toString());
            
            if (problem) {
                processedIds.add(id);
                const videos = await getOrFetchVideo(problem.id, false);
                
                results.push({
                    ...problem,
                    video: (videos && videos.length > 0) ? videos[0] : null,
                    companyStatus: {
                        type: type, 
                        company: companyTitle
                    }
                });
            }
        }
    };

    const title = companyName.charAt(0).toUpperCase() + companyName.slice(1);
    await processList(companyData.asked || [], 'asked', title);
    await processList(companyData.similar || [], 'similar', title);

    res.json(results);
}
