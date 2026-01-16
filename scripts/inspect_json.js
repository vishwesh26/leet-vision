const axios = require('axios');
const SOURCE_URL = 'https://raw.githubusercontent.com/noworneverev/leetcode-api/main/data/leetcode_questions.json';

async function debug() {
    try {
        const response = await axios.get(SOURCE_URL);
        const data = response.data;
        console.log("Type:", typeof data);
        if (Array.isArray(data)) {
            console.log("Length:", data.length);
            console.log("First Item Keys:", Object.keys(data[0]));
            console.log("First Item:", JSON.stringify(data[0], null, 2));
        } else {
            console.log("Keys:", Object.keys(data));
        }
    } catch (e) {
        console.error(e.message);
    }
}
debug();
