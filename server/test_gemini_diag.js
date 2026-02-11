const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function testGemini() {
    const key = process.env.GEMINI_API_KEY;
    console.log(`Using Key: ${key ? key.substring(0, 5) + '...' : 'MISSING'}`);
    
    if (!key) {
        console.error("GEMINI_API_KEY is missing!");
        process.exit(1);
    }

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello, respond with 'AI ACTIVE'");
        console.log("Response:", result.response.text());
    } catch (err) {
        console.error("AI Failure:", err);
    }
}

testGemini();
