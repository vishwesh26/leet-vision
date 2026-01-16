const fs = require('fs');
const path = require('path');
const axios = require('axios');

const TARGET_FILE = path.join(__dirname, '../api/data/problems.json');

const TOPICS = [
    "Array", "String", "Hash Table", "Dynamic Programming", "Math", "Sorting", 
    "Greedy", "Depth-First Search", "Binary Search", "Breadth-First Search", 
    "Tree", "Matrix", "Two Pointers", "Bit Manipulation", "Stack", "Design", 
    "Heap (Priority Queue)", "Backtracking", "Graph", "Simulation", "Sliding Window",
    "Union Find", "Linked List", "Counting", "Monotonic Stack", "Trie", "Recursion", "Divide and Conquer"
];

const GRAPHQL_URL = 'https://leetcode.com/graphql';
const TOPIC_QUERY = `
query topicTag($slug: String!) {
  topicTag(slug: $slug) {
    name
    questions {
      questionFrontendId
      title
      titleSlug
      difficulty
    }
  }
}
`;

// Helper for delay
const delay = ms => new Promise(res => setTimeout(res, ms));

async function fetchAll() {
    console.log("Starting robust fetch...");
    let problemMap = new Map();

    // 1. Fetch Global List (for base metadata and total count coverage)
    try {
        console.log("Fetching global list...");
        const response = await axios.get('https://leetcode.com/api/problems/all/', {
             headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const all = response.data.stat_status_pairs;
        console.log(`Global list has ${all.length} problems.`);

        all.forEach(p => {
             const id = p.stat.questionFrontendId || p.stat.frontend_question_id; // Check keys
             const item = {
                 id: id.toString(),
                 title: p.stat.question__title,
                 slug: p.stat.question__title_slug,
                 difficulty: p.difficulty.level === 1 ? 'Easy' : p.difficulty.level === 2 ? 'Medium' : 'Hard',
                 topics: []
             };
             problemMap.set(item.slug, item);
        });

    } catch (e) {
        console.error("Global fetch failed:", e.message);
        // Continue if possible? No, we need base.
        // Actually, we can build base from topics too.
    }

    // 2. Fetch Topics
    console.log(`Fetching ${TOPICS.length} topics...`);
    for (const topicName of TOPICS) {
        const slug = topicName.toLowerCase().replace(/ /g, '-').replace(/[()]/g, '');
        console.log(`Fetching topic: ${topicName} (${slug})...`);
        
        try {
            // Note: Official API might block non-browser requests or need CSRF.
            // We use simple query, but if it fails, we stick to what we have.
            const res = await axios.post(GRAPHQL_URL, {
                query: TOPIC_QUERY,
                variables: { slug: slug }
            }, {
                headers: { 
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0',
                    'Origin': 'https://leetcode.com'
                }
            });

            // Handle structure
            // Sometimes it returns data.topicTag.questions
            const questions = res.data.data?.topicTag?.questions;
            if (questions) {
                console.log(`   Found ${questions.length} questions.`);
                questions.forEach(q => {
                    let existing = problemMap.get(q.titleSlug);
                    if (!existing) {
                        // Create if missing from global (rare)
                        existing = {
                            id: q.questionFrontendId,
                            title: q.title,
                            slug: q.titleSlug,
                            difficulty: q.difficulty,
                            topics: []
                        };
                        problemMap.set(q.titleSlug, existing);
                    }
                    if (!existing.topics.includes(topicName)) {
                        existing.topics.push(topicName);
                    }
                });
            } else {
                console.warn(`   No questions found for ${topicName} (Response might be empty/null)`);
            }

        } catch (err) {
            console.error(`   Failed to fetch topic ${topicName}:`, err.message);
        }
        
        // Polite delay
        await delay(500); 
    }

    // 3. Save
    const finalArray = Array.from(problemMap.values());
    // Filter out items with no ID (just in case)
    const valid = finalArray.filter(p => p.id && p.title);
    
    // Convert ID to int for sort
    valid.sort((a, b) => parseInt(a.id) - parseInt(b.id));

    console.log(`Saving ${valid.length} problems to ${TARGET_FILE}...`);
    fs.writeFileSync(TARGET_FILE, JSON.stringify(valid, null, 4));
    console.log("Done.");
}

fetchAll();
