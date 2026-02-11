const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        process.exit(1);
    }

    try {
        const genAI = new GoogleGenerativeAI(key);
        // The listModels method is typically used like this in newer SDKs:
        // Note: It might require a different client or be on the genAI object depending on version
        // Actually, for @google/generative-ai, it doesn't always have listModels on the main class
        // Let's try to just hit one that is ALMOST CERTAIN to exist: 'gemini-1.5-flash'
        // Error was 404 Not Found for v1beta.
        
        console.log("Checking gemini-1.5-flash with explicit v1...");
        // Some older SDKs use v1beta, newer ones use v1.
        
        const m = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await m.generateContent("Hi");
        console.log("SUCCESS:", result.response.text());

    } catch (err) {
        console.error("FAILURE:", err.message);
        if (err.stack) console.error(err.stack);
    }
}

listModels();
