const fs = require('fs');
const path = require('path');
const axios = require('axios');

const TARGET_FILE = path.join(__dirname, '../api/data/problems.json');
const SOURCE_URL = 'https://raw.githubusercontent.com/noworneverev/leetcode-api/main/data/leetcode_questions.json';

async function importBulk() {
    console.log(`Fetching data from ${SOURCE_URL}...`);
    try {
        const response = await axios.get(SOURCE_URL);
        const data = response.data;
        
        let items = [];
        if (Array.isArray(data)) {
            items = data;
        } else if (data.questions && Array.isArray(data.questions)) {
            items = data.questions;
        } else {
            console.log("Response is an Object. Converting values to array...");
            items = Object.values(data);
        }

        if (items.length === 0) {
             console.error("No items found in data.");
             return;
        }

        processList(items);

    } catch (err) {
        console.error("Failed to fetch:", err.message);
    }
}

function processList(rawList) {
    console.log(`Processing ${rawList.length} items...`);
    const processed = [];

    rawList.forEach(item => {
        // Map fields based on inspection or standard LeetCode API schemas
        // The structure from noworneverev usually mimics GraphQL:
        // { questionFrontendId, title, titleSlug, difficulty, topicTags: [{name: 'Array'}, ...] }
        
        // Safety checks
        if (!item.questionFrontendId || !item.title) return;

        const newItem = {
            id: item.questionFrontendId,
            title: item.title,
            slug: item.titleSlug,
            difficulty: item.difficulty,
            topics: item.topicTags ? item.topicTags.map(t => t.name) : []
        };
        processed.push(newItem);
    });

    // Sort by ID numerically
    processed.sort((a, b) => parseInt(a.id) - parseInt(b.id));

    console.log(`Successfully processed ${processed.length} problems.`);
    
    // Write
    fs.writeFileSync(TARGET_FILE, JSON.stringify(processed, null, 4));
    console.log(`Saved to ${TARGET_FILE}`);
}

importBulk();
