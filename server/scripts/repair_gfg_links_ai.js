const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const UniversalProblem = require('../models/UniversalProblem');

async function repairLinks() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const gfgProblems = await UniversalProblem.find({ platform: 'geeksforgeeks' });
        console.log(`Analyzing ${gfgProblems.length} GFG problems...`);

        let updatedCount = 0;
        let errorCount = 0;

        for (let i = 0; i < gfgProblems.length; i++) {
            const problem = gfgProblems[i];
            console.log(`[${i+1}/${gfgProblems.length}] Repairing: ${problem.title}`);

            const prompt = `What is the EXACT official GeeksforGeeks practice or article URL for the problem titled: "${problem.title}"? 
            Return ONLY the URL string. No markdown, no explanation.`;

            try {
                const result = await model.generateContent(prompt);
                const aiUrl = result.response.text().trim().replace(/```/g, '');

                if (aiUrl && aiUrl.includes('geeksforgeeks.org') && problem.url !== aiUrl) {
                    console.log(`   Updating: ${problem.url} -> ${aiUrl}`);
                    problem.url = aiUrl;
                    await problem.save();
                    updatedCount++;
                } else {
                    console.log(`   No change needed or invalid URL: ${aiUrl}`);
                }
            } catch (err) {
                console.error(`   Failed for ${problem.title}:`, err.message);
                errorCount++;
                // If we hit a rate limit, wait a bit
                if (err.message.includes('429')) {
                    console.log("   Rate limit hit. Waiting 10s...");
                    await new Promise(r => setTimeout(r, 10000));
                    i--; // Retry this problem
                }
            }

            // Small delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 1000));
        }

        console.log(`Repair completed! Updated: ${updatedCount}, Errors: ${errorCount}`);
        process.exit(0);
    } catch (err) {
        console.error("Repair failed:", err);
        process.exit(1);
    }
}

repairLinks();
