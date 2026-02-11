const axios = require('axios');

async function testUniversalSystem() {
    const API_BASE = "http://localhost:5000/api";
    
    console.log("--- Phase 1: Resolve 'Two Sum' on LeetCode ---");
    try {
        const res1 = await axios.post(`${API_BASE}/resolve-problem`, {
            title: "Two Sum",
            platform: "leetcode",
            url: "https://leetcode.com/problems/two-sum"
        });
        console.log("Status:", res1.data.status);
        
        if (res1.data.status === 'pending') {
            console.log("Generating Concept...");
            const genRes = await axios.post(`${API_BASE}/generate-concept`, {
                title: "Two Sum",
                platform: "leetcode",
                url: "https://leetcode.com/problems/two-sum"
            });
            console.log("Concept Created:", genRes.data.concept.concept_key);
        }

        console.log("\n--- Phase 2: Resolve 'Pair Sum' on HackerRank (Should map to Two Sum Concept) ---");
        const res2 = await axios.post(`${API_BASE}/resolve-problem`, {
            title: "Two Sum", // Using same title but different platform to simulate exact match normalization
            platform: "hackerrank",
            url: "https://www.hackerrank.com/challenges/two-sum"
        });
        
        console.log("Status:", res2.data.status);
        if (res2.data.status === 'mapped') {
            console.log("SUCCESS: Mapped HackerRank problem to existing LeetCode concept!");
            console.log("Concept ID:", res2.data.concept._id);
        }

    } catch (err) {
        console.error("Test Failed:", err.message);
        if (err.response) console.error(err.response.data);
    }
}

testUniversalSystem();
