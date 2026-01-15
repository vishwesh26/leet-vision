const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const SOLUTIONS_DIR = path.join(__dirname, '../data/solutions');

// Ensure solutions dir exists (for local dev mostly)
try {
    if (!fs.existsSync(SOLUTIONS_DIR)) {
        fs.mkdirSync(SOLUTIONS_DIR, { recursive: true });
    }
} catch(e) {}

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const getSolution = async (questionId) => {
    const solutionPath = path.join(SOLUTIONS_DIR, `${questionId}.json`);

    // 1. Check Cache
    if (fs.existsSync(solutionPath)) {
        try {
            const cachedData = JSON.parse(fs.readFileSync(solutionPath, 'utf8'));
            return { ...cachedData, source: 'cached' };
        } catch (err) {
            console.error('[AI Lib] Error reading cache:', err);
        }
    }

    // 2. Generate
    if (!genAI) {
        throw new Error("AI Service not configured: GEMINI_API_KEY missing");
    }

    console.log(`[AI Lib] Generating solution for ${questionId}...`);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    const prompt = `
    Generate for LeetCode question ${questionId}:
    1) Basic solution
    2) Optimized solution
    3) Best solution
    For each: Real code (Python default), Explanation, Time/Space complexity.
    Return valid JSON only. Format:
    {
      "questionId": "${questionId}",
      "title": "Question Title",
      "solutions": {
        "basic": { "code": "...", "time": "...", "space": "...", "explanation": "..." },
        "optimized": { "code": "...", "time": "...", "space": "...", "explanation": "..." },
        "best": { "code": "...", "time": "...", "space": "...", "explanation": "..." }
      }
    }
    Just raw JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    let jsonResponse;
    try {
        jsonResponse = JSON.parse(text);
    } catch (e1) {
        try {
            const JSON5 = require('json5'); 
            jsonResponse = JSON5.parse(text);
        } catch (e2) {
             throw new Error("AI JSON Parse Failed");
        }
    }

    if (jsonResponse && jsonResponse.solutions) {
         try {
            if (process.env.NODE_ENV !== 'production') {
                fs.writeFileSync(solutionPath, JSON.stringify(jsonResponse, null, 2));
            }
         } catch (writeErr) {
             console.error("[AI Lib] Failed to write cache:", writeErr);
         }
    } else {
        throw new Error("AI generated incomplete data");
    }

    return { ...jsonResponse, source: 'ai-generated' };
};

module.exports = { getSolution };
