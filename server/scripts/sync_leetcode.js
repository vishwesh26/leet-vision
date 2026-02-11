const mongoose = require('mongoose');
const UniversalProblem = require('../models/UniversalProblem');
const problemsDb = require('../data/problems.json');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env file');
    process.exit(1);
}

// Curated Top 100 Liked Questions List (IDs)
const TOP_100_IDS = [
  1, 2, 3, 4, 5, 10, 11, 15, 17, 19, 20, 21, 22, 23, 31, 32, 33, 34, 35, 39,
  41, 42, 46, 48, 49, 53, 55, 56, 62, 64, 70, 72, 75, 76, 78, 79, 84, 85, 94, 96, 98,
  101, 102, 104, 105, 114, 121, 124, 128, 136, 139, 141, 142, 146, 148, 152, 155, 160, 169, 198,
  200, 206, 207, 208, 215, 221, 226, 234, 236, 238, 239, 240, 253, 279, 283, 287, 295, 297, 300, 
  301, 309, 322, 337, 338, 347, 394, 399, 406, 416, 437, 438, 448, 494, 543, 560, 581, 617, 647, 739
];

// Curated Blind 75 List (IDs)
const BLIND_75_IDS = [
  1, 121, 217, 238, 15, 11, 153, 33, 3, 424, 76, 242, 49, 20, 125, 5, 647, 198, 213, 300, 322, 
  139, 1143, 62, 190, 191, 338, 268, 371, 54, 48, 73, 206, 21, 143, 19, 141, 23, 104, 100, 226, 
  102, 572, 98, 230, 235, 105, 211, 208, 252, 253, 435, 56, 57, 269, 200, 133, 417, 207, 210, 
  261, 323, 212, 79, 347, 39, 128, 295
];

const syncLeetCode = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        console.log(`Loaded ${problemsDb.length} problems from JSON.`);
        
        // Filter: We might not want ALL 2000+ problems in Universal yet if we want to keep it curated?
        // User request: "taken from the topic wise page or top 100"
        // Topic wise page allows browsing ALL topics.
        // So we should probably sync ALL problems that have topics.
        // But maybe prioritizing the curated lists is safer to avoid bloating if Universal is meant to be lighter.
        // However, "Universal" implies broad access.
        // Let's sync ALL problems from problems.json, as they are the source of truth for the app.
        
        let upsertCount = 0;

        for (const p of problemsDb) {
            const pid = parseInt(p.id);
            const tags = [...(p.topics || [])];
            
            if (TOP_100_IDS.includes(pid)) tags.push("Top 100 Liked");
            if (BLIND_75_IDS.includes(pid)) tags.push("Blind 75");

            // Normalize tags? (e.g. "Hash Table" -> "Hashing" to match other platforms?)
            // We can do some mapping to align with CodeChef/GFG tags for better grouping.
            // Current GFG/CodeChef tags: "Arrays", "Strings", "Dynamic Programming", "Graph", "Tree", "Stack & Queue", "Linked List", "Searching & Sorting"
            
            const standardizedTags = tags.map(t => {
                if (t === 'Hash Table') return 'Hashing';
                if (t === 'Heap (Priority Queue)') return 'Heaps';
                if (t === 'Stack') return 'Stacks'; // or Stack & Queue
                if (t === 'Queue') return 'Queues';
                // keep others as is for now, or add multiple aliases
                return t;
            });
            
            // If we want to group "Stacks" and "Queues" together under "Stack & Queue" like GFG:
            if (standardizedTags.includes('Stacks') || standardizedTags.includes('Queues')) {
                if (!standardizedTags.includes('Stack & Queue')) standardizedTags.push('Stack & Queue');
            }

            const problemData = {
                title: p.title,
                url: `https://leetcode.com/problems/${p.slug}/`,
                platform: 'leetcode', // Force lowercase
                slug: p.slug,
                tags: standardizedTags,
                questionId: pid.toString(), // Store as string
                // We could add difficulty if the schema supports it, strictly speaking UniversalProblem might not use it for grouping yet but good to have
            };

            // Upsert based on slug (unique identifier for LC)
            const result = await UniversalProblem.findOneAndUpdate(
                { platform: 'leetcode', slug: p.slug },
                { $set: problemData },
                { upsert: true, new: true }
            );
            
            if (result) upsertCount++;
        }

        console.log(`Synced ${upsertCount} LeetCode problems to UniversalProblem collection.`);

    } catch (error) {
        console.error('Error syncing LeetCode:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

syncLeetCode();
