const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Concept = require('../models/Concept');
const Explanation = require('../models/Explanation');

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // 1. Unset intuition_text in Concepts
        const conceptResult = await Concept.updateMany(
            {}, 
            { $unset: { intuition_text: "" } }
        );
        console.log(`Updated Concepts: ${conceptResult.modifiedCount}`);

        // 2. Unset intuition in Explanations
        const explanationResult = await Explanation.updateMany(
            {}, 
            { $unset: { intuition: "" } }
        );
        console.log(`Updated Explanations: ${explanationResult.modifiedCount}`);

        console.log("Cleanup complete!");
        process.exit(0);
    } catch (err) {
        console.error("Cleanup failed:", err);
        process.exit(1);
    }
}

cleanup();
