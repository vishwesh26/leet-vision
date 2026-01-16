const fs = require('fs');
const path = require('path');
const axios = require('axios');

const TARGET_FILE = path.join(__dirname, '../api/data/problems.json');
// Using the gist ID found
const SOURCE_URL = 'https://gist.githubusercontent.com/dabasajay/1c42402db1b5a1b47ea009e67ad3effe/raw/problemslist.json';

async function importGist() {
    console.log(`Fetching data from ${SOURCE_URL}...`);
    try {
        const response = await axios.get(SOURCE_URL);
        const data = response.data;
        
        let dataArray = [];
        if (Array.isArray(data)) {
            dataArray = data;
        } else {
            console.log("Data is an object, converting values to array...");
            dataArray = Object.values(data);
        }

        console.log(`Received ${dataArray.length} items.`);
        
        const processed = dataArray.map(item => {
            // Need to map keys. inspect first item usually helps, but assume standard names or verify
            // Usually: { id, title, titleSlug, difficulty, topicTags: [] }
            // Let's log the first item to safely see keys if there's a mismatch, 
            // but we can try to guess common ones.
            return {
                id: (item.questionFrontendId || item.id || '').toString(),
                title: item.title,
                slug: item.titleSlug || item.slug,
                difficulty: item.difficulty,
                topics: item.topicTags ? item.topicTags.map(t => t.name || t) : (item.topics || [])
            };
        }).filter(p => p.id && p.title);

        processed.sort((a, b) => parseInt(a.id) - parseInt(b.id));

        console.log(`Processed ${processed.length} valid problems.`);
        fs.writeFileSync(TARGET_FILE, JSON.stringify(processed, null, 4));
        console.log(`Saved to ${TARGET_FILE}`);

    } catch (err) {
        console.error("Failed:", err.message);
    }
}

importGist();
