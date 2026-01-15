const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

console.log("Checking API Key...");
if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing! Loaded from:", path.join(__dirname, '.env'));
    process.exit(1);
} else {
    console.log("✅ GEMINI_API_KEY is present:", process.env.GEMINI_API_KEY.substring(0, 10) + "...");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGeneration() {
    const questionId = "5";
    console.log(`Starting generation for ID: ${questionId}`);

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `
        Generate for LeetCode question ${questionId}:
        1) Basic solution
        2) Optimized solution
        3) Best solution
        Return valid JSON only.
        `;

        console.log("Sending prompt to Gemini...");
        const result = await model.generateContent(prompt);
        console.log("Got result object.");
        
        const response = await result.response;
        console.log("Got response object.");
        
        const text = response.text();
        console.log("Got text:", text.substring(0, 100) + "...");
        
        const json = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
        console.log("✅ JSON Parsed successfully!");
        
    } catch (err) {
        console.error("❌ FAILED:");
        console.error(err);
        if (err.response) {
            console.error("Response error data:", err.response);
        }
    }
}

testGeneration();
