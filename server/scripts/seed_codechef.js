const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const UniversalProblem = require('../models/UniversalProblem');
const codechefQuestions = require('./codechef_master_list');

const seedCodechef = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        console.log(`Processing ${codechefQuestions.length} CodeChef questions...`);

        let added = 0;
        let updated = 0;
        let skipped = 0;

        for (const q of codechefQuestions) {
            // Determine tags (Topic)
            let tags = q.tags || [];
            
            // Clean up tags if needed (e.g. "Module 1: Basic programming - 1" -> "Basic Programming")
            // The generator already does some extraction, but let's ensure it's clean
            
            const result = await UniversalProblem.updateOne(
                { platform: 'codechef', slug: q.slug },
                { 
                    $set: { 
                        title: q.title, 
                        url: q.url,
                        platform: 'codechef',
                        tags: tags // Update tags
                    },
                    $setOnInsert: {
                        last_seen_at: new Date()
                    }
                },
                { upsert: true }
            );

            if (result.upsertedCount > 0) {
                added++;
            } else if (result.modifiedCount > 0) {
                updated++;
            } else {
                skipped++;
            }
        }

        console.log('\nSeeding Complete!');
        console.log(`Added: ${added}`);
        console.log(`Updated: ${updated}`);
        console.log(`Skipped (No Change): ${skipped}`);
        console.log(`Total Processed: ${codechefQuestions.length}`);

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
};

seedCodechef();
