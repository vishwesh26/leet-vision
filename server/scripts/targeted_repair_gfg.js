const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const UniversalProblem = require('../models/UniversalProblem');

async function targetedRepair() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const targets = [
            "Maximum sum of three stacks",
            "Activity Selection Problem",
            "Policemen catch thieves"
        ];

        for (const title of targets) {
            console.log(`Repairing: ${title}`);
            const problem = await UniversalProblem.findOne({ title, platform: 'geeksforgeeks' });
            
            if (!problem) {
                console.log(`   Problem not found in DB: ${title}`);
                continue;
            }

            const prompt = `What is the EXACT official GeeksforGeeks practice or article URL for the problem titled: "${title}"? 
            Return ONLY the URL string. No markdown, no explanation.`;

            try {
                const result = await model.generateContent(prompt);
                const aiUrl = result.response.text().trim().replace(/```/g, '');

                if (aiUrl && aiUrl.includes('geeksforgeeks.org')) {
                    console.log(`   Updating: ${problem.url} -> ${aiUrl}`);
                    problem.url = aiUrl;
                    await problem.save();
                }
            } catch (err) {
                console.error(`   Failed for ${title}:`, err.message);
            }
        }

        console.log("Targeted repair complete!");
        process.exit(0);
    } catch (err) {
        console.error("Repair failed:", err);
        process.exit(1);
    }
}

targetedRepair();
