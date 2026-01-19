const https = require('https');
const fs = require('fs');
const path = require('path');

const TARGET_FILE = path.join(__dirname, '..', 'data', 'problems.json');

console.log('Fetching all problems from LeetCode API...');

https.get('https://leetcode.com/api/problems/all/', (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const jsonData = JSON.parse(data);
            const questions = jsonData.stat_status_pairs.map(q => ({
                id: q.stat.frontend_question_id.toString(),
                title: q.stat.question__title,
                slug: q.stat.question__title_slug,
                difficulty: q.difficulty.level === 1 ? 'Easy' : q.difficulty.level === 2 ? 'Medium' : 'Hard',
                topics: [] // API doesn't return topics here, but better than nothing
            }));

            // Sort by ID
            questions.sort((a, b) => parseInt(a.id) - parseInt(b.id));

            console.log(`Fetched ${questions.length} problems.`);
            
            // Merge with existing to keep topics if possible? 
            // Actually, existing list is so small (73) vs 3000+, topics are sacrificed for coverage for now.
            // Or we could try to preserve topics for the 73 we have.
            
            let existing = [];
            try {
                if (fs.existsSync(TARGET_FILE)) {
                   existing = JSON.parse(fs.readFileSync(TARGET_FILE, 'utf8'));
                }
            } catch(e) {}

            const topicMap = {};
            existing.forEach(p => {
                if (p.topics) topicMap[p.id] = p.topics;
            });

            questions.forEach(q => {
                if (topicMap[q.id]) {
                    q.topics = topicMap[q.id];
                }
            });

            fs.writeFileSync(TARGET_FILE, JSON.stringify(questions, null, 4));
            console.log(`Successfully saved to ${TARGET_FILE}`);

        } catch (err) {
            console.error('Error parsing JSON:', err.message);
        }
    });

}).on('error', (err) => {
    console.error('Error fetching data:', err.message);
});
