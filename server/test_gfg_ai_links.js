const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function testLinkDiscovery() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const problems = [
        "Maximum sum of three stacks",
        "Activity Selection Problem",
        "Policemen catch thieves"
    ];

    for (const title of problems) {
        const prompt = `What is the official GeeksforGeeks practice or article URL for the problem: "${title}"? 
        Return ONLY the URL string.`;
        
        try {
            const result = await model.generateContent(prompt);
            console.log(`Title: ${title} -> AI URL: ${result.response.text().trim()}`);
        } catch (e) {
            console.log(`Failed for ${title}: ${e.message}`);
        }
    }
}

testLinkDiscovery();
