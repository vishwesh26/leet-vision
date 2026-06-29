const axios = require('axios');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://127.0.0.1:${PORT}/api/external`;
const API_KEY = process.env.EXTERNAL_API_KEY || 'leet_vision_secret_dev_key';

async function runTests() {
    console.log("🚀 Starting verification tests for /api/external/questions...\n");

    // Test 1: Request without x-api-key header (Should fail with 401)
    try {
        console.log("📋 Test 1: Request with no API Key...");
        await axios.get(`${BASE_URL}/questions`);
        console.log("❌ Test 1 Failed: Expected 401 Unauthorized, but request succeeded.\n");
    } catch (err) {
        if (err.response && err.response.status === 401) {
            console.log("✅ Test 1 Passed: Request blocked with 401 Unauthorized.\n");
        } else {
            console.log("❌ Test 1 Failed: Unexpected error", err.message, err.stack, "\n");
        }
    }

    // Test 2: Request with invalid API Key (Should fail with 401)
    try {
        console.log("📋 Test 2: Request with invalid API Key...");
        await axios.get(`${BASE_URL}/questions`, {
            headers: { 'x-api-key': 'wrong_key' }
        });
        console.log("❌ Test 2 Failed: Expected 401 Unauthorized, but request succeeded.\n");
    } catch (err) {
        if (err.response && err.response.status === 401) {
            console.log("✅ Test 2 Passed: Request blocked with 401 Unauthorized.\n");
        } else {
            console.log("❌ Test 2 Failed: Unexpected error", err.message, err.stack, "\n");
        }
    }

    // Helper function for authorized requests
    const authorizedGet = async (params = {}) => {
        return axios.get(`${BASE_URL}/questions`, {
            headers: { 'x-api-key': API_KEY },
            params
        });
    };

    // Test 3: Fetch default questions (limit=5)
    try {
        console.log("📋 Test 3: Fetching default list (limit=5)...");
        const res = await authorizedGet({ limit: 5 });
        if (res.data.success && Array.isArray(res.data.questions)) {
            console.log(`✅ Test 3 Passed: Retrieved ${res.data.questions.length} questions. Total in DB: ${res.data.total}`);
            if (res.data.questions.length > 0) {
                console.log(`   Sample question: "${res.data.questions[0].title}" by ${res.data.questions[0].company || 'Unknown'}`);
            }
            console.log();
        } else {
            console.log("❌ Test 3 Failed: Unexpected response format", res.data, "\n");
        }
    } catch (err) {
        console.log("❌ Test 3 Failed: Error fetching default list:", err.message, err.response ? err.response.data : '', err.stack, "\n");
    }

    // Test 4: Filter by Company, Topic and Difficulty
    try {
        console.log("📋 Test 4: Fetching questions filtered by Company=Google, Topic=Array, Difficulty=Medium...");
        const res = await authorizedGet({
            company: 'Google',
            topic: 'Array',
            difficulty: 'Medium',
            limit: 3
        });
        if (res.data.success && Array.isArray(res.data.questions)) {
            console.log(`✅ Test 4 Passed: Found ${res.data.total} matching questions. Returned ${res.data.questions.length}.`);
            res.data.questions.forEach((q, idx) => {
                console.log(`   ${idx + 1}. [${q.difficulty}] ${q.title} (Topics: ${q.topics.join(', ')}, Company: ${q.company})`);
            });
            console.log();
        } else {
            console.log("❌ Test 4 Failed: Unexpected response format", res.data, "\n");
        }
    } catch (err) {
        console.log("❌ Test 4 Failed:", err.message, err.response ? err.response.data : '', err.stack, "\n");
    }

    // Test 5: Random selection
    try {
        console.log("📋 Test 5: Fetching 3 random Medium questions for Google...");
        const res = await authorizedGet({
            company: 'Google',
            difficulty: 'Medium',
            random: 'true',
            limit: 3
        });
        if (res.data.success && Array.isArray(res.data.questions)) {
            console.log(`✅ Test 5 Passed: Random mode returned ${res.data.questions.length} random sample(s).`);
            res.data.questions.forEach((q, idx) => {
                console.log(`   - Sample ${idx + 1}: ${q.title} (Difficulty: ${q.difficulty}, Company: ${q.company})`);
            });
            console.log();
        } else {
            console.log("❌ Test 5 Failed: Unexpected response format", res.data, "\n");
        }
    } catch (err) {
        console.log("❌ Test 5 Failed:", err.message, err.response ? err.response.data : '', err.stack, "\n");
    }

    // Test 6: CORS Origin check for external domain (Should respond with access-control-allow-origin reflecting the origin)
    try {
        console.log("📋 Test 6: Request from external origin (CORS verification)...");
        const externalOrigin = 'https://my-interview-app.com';
        const res = await axios.get(`${BASE_URL}/questions`, {
            headers: { 
                'x-api-key': API_KEY,
                'Origin': externalOrigin
            },
            params: { limit: 1 }
        });
        const allowedOriginHeader = res.headers['access-control-allow-origin'];
        if (allowedOriginHeader === externalOrigin || allowedOriginHeader === '*') {
            console.log(`✅ Test 6 Passed: CORS allowed request from "${externalOrigin}" (Access-Control-Allow-Origin: ${allowedOriginHeader})\n`);
        } else {
            console.log(`❌ Test 6 Failed: CORS rejected or did not reflect origin. Header: "${allowedOriginHeader}"\n`);
        }
    } catch (err) {
        console.log("❌ Test 6 Failed:", err.message, err.response ? err.response.data : '', err.stack, "\n");
    }

    console.log("🏁 Tests finished.");
}

// Small delay to ensure DB connection is ready on local server if restarted
setTimeout(runTests, 1000);
