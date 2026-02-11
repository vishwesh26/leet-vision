const mongoose = require('mongoose');
const UniversalProblem = require('../models/UniversalProblem');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env file');
    process.exit(1);
}

const checkTags = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const platforms = ['leetcode', 'hackerrank'];

        for (const platform of platforms) {
            console.log(`\n--- Checking ${platform} ---`);
            const problems = await UniversalProblem.find({ platform: platform }).limit(100);
            const total = await UniversalProblem.countDocuments({ platform: platform });
            
            console.log(`Total questions: ${total}`);
            
            if (total === 0) continue;

            let taggedCount = 0;
            const sampleTags = new Set();

            problems.forEach(p => {
                if (p.tags && p.tags.length > 0) {
                    taggedCount++;
                    p.tags.forEach(t => sampleTags.add(t));
                }
            });

            console.log(`Sample tagged count (first 100): ${taggedCount}`);
            console.log(`Sample tags found:`, Array.from(sampleTags).slice(0, 10));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected');
    }
};

checkTags();
