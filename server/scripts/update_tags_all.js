const mongoose = require('mongoose');
const UniversalProblem = require('../models/UniversalProblem');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env file');
    process.exit(1);
}

const TOPIC_KEYWORDS = {
    "Dynamic Programming": ["dp", "dynamic programming", "knapsack", "coin change", "subset sum", "longest common", "longest increasing", "edit distance", "climbing stairs", "egg dropping", "matrix chain", "partition", "cut", "maximize cut", "minimum sum partition"],
    "Graph": ["graph", "island", "bfs", "dfs", "cycle", "bridge", "connected component", "alien dictionary", "dijkstra", "bellman", "floyd", "prim", "kruskal", "topological", "bipartite", "snake ladder", "water flow"],
    "Tree": ["tree", "bst", "ancestor", "traversal", "preorder", "inorder", "postorder", "level order", "diameter", "height of", "lowest common ancestor", "serialize"],
    "Linked List": ["linked list", "node", "reorder list", "detect loop", "middle element"],
    "Stack & Queue": ["stack", "queue", "postfix", "infix", "valid substring", "histogram", "next greater", "parenthesis", "rotten oranges", "sliding window maximum", "celebrity"],
    "Matrix": ["matrix", "grid", "spiral", "rotate", "boolean matrix", "tic tac toe", "search a word"],
    "Strings": ["string", "palindrome", "anagram", "reverse", "substring", "roman", "atoi", "pattern", "isomorphic", "pangram"],
    "Bit Manipulation": ["bit", "xor", "set bits", "power of 2", "divide integers"],
    "Recursion & Backtracking": ["recursion", "backtracking", "n-queen", "sudoku", "rat in a maze", "permutations", "combination"],
    "Searching & Sorting": ["search", "sort", "binary search", "kth element", "peak element", "median", "merge two sorted", "inversion", "allocate minimum"],
    "Arrays": ["array", "subarray", "duplicate", "missing number", "rain water", "stock", "interval", "majority element", "kadane", "merge sorted", "pascal", "product puzzle", "chocolate", "triplet", "two sum", "three sum"]
};

const PRIORITY_ORDER = [
    "Dynamic Programming",
    "Graph",
    "Tree",
    "Linked List",
    "Stack & Queue",
    "Matrix",
    "Recursion & Backtracking",
    "Bit Manipulation",
    "Strings",
    "Searching & Sorting",
    "Arrays"
];

const determineTopic = (title) => {
    const lowerTitle = title.toLowerCase();
    for (const topic of PRIORITY_ORDER) {
        const keywords = TOPIC_KEYWORDS[topic];
        if (keywords.some(k => lowerTitle.includes(k))) {
            return topic;
        }
    }
    return "Arrays"; // Default fallback
};

const updateTags = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const platforms = ['leetcode', 'hackerrank', 'geeksforgeeks'];

        for (const platform of platforms) {
            console.log(`\nProcessing platform: ${platform}...`);
            const problems = await UniversalProblem.find({ platform: platform });
            console.log(`Found ${problems.length} problems.`);

            let updatedCount = 0;
            for (const problem of problems) {
                // If it already has tags and we don't want to overwrite, we could skip.
                // But heuristic might be better than nothing or previous bad tags.
                // For GFG we already ran it. CodeChef has 'tags' from module.
                // Let's just run it for everyone to be safe and consistent, 
                // OR skip if tags exist to respect 'manual' tags (like CodeChef).
                // CodeChef is NOT in the list 'platforms' above, so it's safe.
                
                const topic = determineTopic(problem.title);
                
                let needsUpdate = false;
                if (!problem.tags || problem.tags.length === 0) {
                    needsUpdate = true;
                } else if (!problem.tags.includes(topic)) {
                     // Check if existing tag is "Uncategorized" or similar?
                     // Or just overwrite?
                     // Let's overwrite / set primary tag.
                     needsUpdate = true;
                }

                if (needsUpdate) {
                    problem.tags = [topic];
                    await problem.save();
                    updatedCount++;
                }
            }
            console.log(`Updated ${updatedCount} problems for ${platform}.`);
            
             // Print distribution
            const freshProblems = await UniversalProblem.find({ platform: platform });
            const distribution = {};
            freshProblems.forEach(p => {
                const t = p.tags[0] || 'Uncategorized';
                distribution[t] = (distribution[t] || 0) + 1;
            });
            console.log(`${platform} Topic Distribution:`, distribution);
        }

    } catch (error) {
        console.error('Error updating tags:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

updateTags();
