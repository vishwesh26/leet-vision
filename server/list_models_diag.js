const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("GEMINI_API_KEY is missing!");
        process.exit(1);
    }

    try {
        const genAI = new GoogleGenerativeAI(key);
        // Standard list models call might depend on SDK version
        console.log("Fetching available models...");
        // In newer SDKs, listModels isn't directly on genAI usually, 
        // but we can try common ones.
        
        const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro", "gemini-1.0-pro"];
        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("test");
                console.log(`[WORKING] ${m}`);
            } catch (e) {
                console.log(`[FAILED] ${m}: ${e.message}`);
            }
        }
    } catch (err) {
        console.error("Critical Failure:", err);
    }
}

listModels();
