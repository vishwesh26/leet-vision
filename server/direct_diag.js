const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function diagnose() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    
    console.log(`Pinging: ${url.replace(key, 'REDACTED')}`);
    
    try {
        const response = await axios.get(url);
        console.log("Available Models:", JSON.stringify(response.data.models.map(m => m.name), null, 2));
    } catch (err) {
        if (err.response) {
            console.error("API Error Body:", JSON.stringify(err.response.data, null, 2));
        } else {
            console.error("Fetch Error:", err.message);
        }
    }
}

diagnose();
