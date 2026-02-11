const mongoose = require('mongoose');
const UniversalProblem = require('../models/UniversalProblem');
require('dotenv').config(); // Loads from root .env by default when running from root

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
    "Arrays": ["array", "subarray", "duplicate", "missing number", "rain water", "stock", "interval", "majority element", "kadane", "merge sorted", "pascal", "product puzzle", "chocolate", "triplet"]
};

// Order matters: check more specific topics before generic ones (like Arrays)
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

        const problems = await UniversalProblem.find({ platform: 'geeksforgeeks' });
        console.log(`Found ${problems.length} GFG problems to process.`);

        let updatedCount = 0;
        for (const problem of problems) {
            const topic = determineTopic(problem.title);
            
            // Update the problem with the new tag
            // We verify if it already has tags, but we'll overwrite or append? 
            // Requests say "do same for gfg", implying valid topic grouping.
            // Let's overwrite 'tags' to be clean.
            
            // Only update if tag is different to avoid db churn
            if (!problem.tags || !problem.tags.includes(topic)) {
                problem.tags = [topic];
                await problem.save();
                updatedCount++;
                // console.log(`Updated "${problem.title}" -> ${topic}`);
            }
        }

        console.log(`Successfully updated tags for ${updatedCount} problems.`);
        
        // Print distribution
        const freshProblems = await UniversalProblem.find({ platform: 'geeksforgeeks' });
        const distribution = {};
        freshProblems.forEach(p => {
            const t = p.tags[0] || 'Uncategorized';
            distribution[t] = (distribution[t] || 0) + 1;
        });
        console.log("Topic Distribution:", distribution);

    } catch (error) {
        console.error('Error updating tags:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

updateTags();
