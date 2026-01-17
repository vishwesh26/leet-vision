const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const path = require('path');

// Load from server/.env
dotenv.config({ path: path.join(__dirname, '../server/.env') });

console.log("Loaded Key:", process.env.GEMINI_API_KEY ? "Found (Starts with " + process.env.GEMINI_API_KEY.substring(0, 5) + ")" : "Missing");

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Calling model...");
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log("Success:", response.text());
    } catch (e) {
        console.error("FAILED:", e);
    }
}

test();
