const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const UniversalProblemSchema = new mongoose.Schema({
    platform: String,
    title: String,
    url: String
}, { strict: false });

const UniversalProblem = mongoose.model('UniversalProblem', UniversalProblemSchema, 'universalproblems');

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const testProblems = [
            "Pair with the given Sum",
            "Best Time to Buy and Sell Stock",
            "Height of Binary Tree",  // Tree
            "Heap Sort",              // Heap
            "BFS of Graph",           // Graph
            "Nth Catalan Number",     // DP
            "Search in Rotated Sorted Array" // Searching
        ];

        for (const title of testProblems) {
            const problem = await UniversalProblem.findOne({ title, platform: 'geeksforgeeks' });
            if (problem) {
                console.log(`Title: ${problem.title}`);
                console.log(`URL:   ${problem.url}`);
            } else {
                console.log(`Problem not found: ${title}`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
