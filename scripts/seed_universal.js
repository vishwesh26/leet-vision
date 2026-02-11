const axios = require('axios');

const SEED_PROBLEMS = [
    { title: "Two Sum", platform: "leetcode", url: "https://leetcode.com/problems/two-sum" },
    { title: "Validate Binary Search Tree", platform: "leetcode", url: "https://leetcode.com/problems/validate-binary-search-tree" },
    { title: "Longest Substring Without Repeating Characters", platform: "leetcode", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters" },
    { title: "Number of Islands", platform: "leetcode", url: "https://leetcode.com/problems/number-of-islands" },
    
    // HackerRank
    { title: "Find the Point", platform: "hackerrank", url: "https://www.hackerrank.com/challenges/find-the-point/problem" },
    { title: "Balanced Brackets", platform: "hackerrank", url: "https://www.hackerrank.com/challenges/balanced-brackets/problem" },
    { title: "Left Rotation", platform: "hackerrank", url: "https://www.hackerrank.com/challenges/array-left-rotation/problem" },
    
    // GeeksforGeeks
    { title: "Missing Number", platform: "geeksforgeeks", url: "https://www.geeksforgeeks.org/problems/missing-number-in-array1416/1" },
    { title: "Detect Loop in Linked List", platform: "geeksforgeeks", url: "https://www.geeksforgeeks.org/problems/detect-loop-in-linked-list/1" },
    { title: "Trapping Rain Water", platform: "geeksforgeeks", url: "https://www.geeksforgeeks.org/problems/trapping-rain-water-1587115621/1" },
    
    // CodeChef
    { title: "Chef and Dolls", platform: "codechef", url: "https://www.codechef.com/problems/ATTENDU" },
    { title: "ATM", platform: "codechef", url: "https://www.codechef.com/problems/HS08TEST" }
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function seed() {
    const API_BASE = "http://localhost:5000/api";
    console.log(`Starting seeding for ${SEED_PROBLEMS.length} problems...`);

    for (const problem of SEED_PROBLEMS) {
        try {
            console.log(`Processing: ${problem.title}...`);
            const res = await axios.post(`${API_BASE}/generate-concept`, problem);
            console.log(`✅ Success: ${res.data.concept.concept_key}`);
            await sleep(2000); // 2 second delay
        } catch (err) {
            console.error(`❌ Failed: ${problem.title}`, err.message);
        }
    }
    console.log("Seeding complete!");
}

seed();
