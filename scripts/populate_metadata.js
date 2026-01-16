const fs = require('fs');
const path = require('path');
const axios = require('axios');

const PROBLEMS_FILE = path.join(__dirname, '../api/data/problems.json');
const PLANS_FILE = path.join(__dirname, '../api/data/company_plans.json');

// GraphQL Query
const QUERY = `
    query questionData($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
            questionFrontendId
            title
            titleSlug
            difficulty
            topicTags {
                name
            }
        }
    }
`;

// Helper: We need titleSlug to query details, but we only have ID.
// Actually, we can search by ID too or use problems api?
// "https://leetcode.com/api/problems/all/" provides a full list mapped to ID.
// That is much more efficient than scraping individually.

async function populate() {
    console.log("Loading data...");
    const problems = require(PROBLEMS_FILE);
    const plans = require(PLANS_FILE);

    const existingIds = new Set(problems.map(p => p.id));
    const neededIds = new Set();

    // Collect all needed IDs
    Object.values(plans).forEach(company => {
        Object.values(company).forEach(level => {
            if (level.dsa_ids) {
                level.dsa_ids.forEach(id => {
                    if (!existingIds.has(id)) {
                        neededIds.add(id);
                    }
                });
            }
        });
    });

    if (neededIds.size === 0) {
        console.log("All problems are already present in the database.");
        return;
    }

    console.log(`Found ${neededIds.size} missing problems. Fetching metadata...`);

    // Fetch Full List from LeetCode
    // usage of 'https://leetcode.com/api/problems/all/'
    try {
        console.log("Fetching global problem list from LeetCode...");
        const response = await axios.get('https://leetcode.com/api/problems/all/', {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });
        
        const allProblems = response.data.stat_status_pairs;
        const missing = Array.from(neededIds);
        let addedCount = 0;

        missing.forEach(missingId => {
            const match = allProblems.find(p => p.stat.frontend_question_id.toString() === missingId.toString());
            if (match) {
                const newProblem = {
                    id: match.stat.frontend_question_id.toString(),
                    title: match.stat.question__title,
                    slug: match.stat.question__title_slug,
                    difficulty: match.difficulty.level === 1 ? 'Easy' : match.difficulty.level === 2 ? 'Medium' : 'Hard',
                    topics: [] // The global list doesn't include tags, but this is better than 'Unknown'
                };
                problems.push(newProblem);
                addedCount++;
                console.log(`+ Added: [${newProblem.id}] ${newProblem.title}`);
            } else {
                console.warn(`! Could not find ID: ${missingId} in global list.`);
            }
        });

        // Write back
        fs.writeFileSync(PROBLEMS_FILE, JSON.stringify(problems, null, 4));
        console.log(`Success! Added ${addedCount} new problems to database.`);

    } catch (err) {
        console.error("Failed to fetch data:", err.message);
    }
}

populate();
