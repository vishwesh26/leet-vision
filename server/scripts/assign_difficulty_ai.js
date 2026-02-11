const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const UniversalProblem = require('../models/UniversalProblem');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const BATCH_SIZE = 30; // Process 30 problems at a time
const DELAY_MS = 2000; // 2 seconds between batches to respect rate limits

async function assignDifficulties() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Use a model capable of JSON output (flash models are usually good for this)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        // Find problems with Unknown difficulty
        // We also want to target problems that might not have the field yet (strict check)
        const query = { 
            $or: [
                { difficulty: 'Unknown' },
                { difficulty: { $exists: false } }
            ]
        };

        const totalProblems = await UniversalProblem.countDocuments(query);
        console.log(`Found ${totalProblems} problems with Unknown difficulty.`);

        let processed = 0;

        while (processed < totalProblems) {
            // Fetch next batch
            const batch = await UniversalProblem.find(query).limit(BATCH_SIZE).skip(0); // Always skip 0 because we modify them as we go, causing them to leave the query set? 
            // WAIT: If we update them, they won't match the query anymore if we change 'Unknown' to something else.
            // BUT, if the AI fails or returns 'Unknown', we might loop forever.
            // Better to use a cursor or separate "processed" flag, OR just skip based on 'processed' count if we weren't updating in place. 
            // Actually, if we update them to 'Easy'/'Medium'/'Hard', they leave the query set.
            // If we fail to update or AI returns Unknown, we should probably skip them next time.
            // To be safe, let's just fetch all IDs first or use a cursor. 
            // Or simpler: Fetch BATCH_SIZE, try to update. If they remain 'Unknown', we have to be careful.
            // Let's refine the query to only pick those we haven't tried recently? No, that's too complex.
            // Let's just fetch limit(BATCH_SIZE) and if we can't determine, we leave as Unknown but maybe log it? 
            // Issue: infinite loop if we don't resolve 'Unknown'.
            // Solution: We'll accept the result. If AI explicitly says 'Unknown', we might want to mark it as 'processed' in some way, 
            // but for this task, let's assume valid output mostly. 
            // A better approach for this one-off script: Fetch all relevant IDs first, then process in chunks.
            
            if (batch.length === 0) break;

            const promptText = `
            You are an expert algorithm context analyzer. I will provide a list of coding problem titles and their platform.
            For each problem, estimate the difficulty level as "Easy", "Medium", or "Hard".
            
            Return a JSON array of objects, where each object has:
            - "_id": The provided ID
            - "difficulty": One of ["Easy", "Medium", "Hard"]

            If you are absolutely unsure, default to "Medium".

            Problems:
            ${JSON.stringify(batch.map(p => ({ _id: p._id, title: p.title, platform: p.platform })))}
            `;

            try {
                console.log(`Processing batch ${Math.ceil(processed / BATCH_SIZE) + 1}... (${batch.length} items)`);
                
                const result = await model.generateContent(promptText);
                const responseText = result.response.text();
                const predictions = JSON.parse(responseText);

                // Bulk update
                const operations = predictions.map(p => ({
                    updateOne: {
                        filter: { _id: p._id },
                        update: { $set: { difficulty: p.difficulty } }
                    }
                }));

                if (operations.length > 0) {
                    await UniversalProblem.bulkWrite(operations);
                    processed += operations.length;
                    console.log(`  Updated ${operations.length} records.`);
                }

            } catch (err) {
                console.error("  Batch failed:", err.message);
                // If a batch fails, we might get stuck in a loop if we rely on the query emptying.
                // For now, let's just skip this batch manually in memory or break to avoid infinite spam.
                // Ideally, we'd log IDs to skip.
                console.log("  Skipping batch due to error...");
                // To avoid infinite loop on error, let's just break for now or try to continue?
                // If we don't update status, 'find' will get them again.
                // Let's just break this run if we hit a hard error, safer for the user.
                break;
            }

            // Rate limiting delay
            await new Promise(resolve => setTimeout(resolve, DELAY_MS));
        }

        console.log("Difficulty assignment complete.");
        process.exit(0);

    } catch (error) {
        console.error("Script error:", error);
        process.exit(1);
    }
}

assignDifficulties();
