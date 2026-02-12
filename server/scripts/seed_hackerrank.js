const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const UniversalProblem = require('../models/UniversalProblem');
const hackerrankQuestions = require('./hackerrank_master_list');

const extractSlug = (url) => {
    try {
        const parts = url.split('/challenges/');
        if (parts.length > 1) {
            return parts[1].split('/')[0].split('?')[0];
        }
        return null;
    } catch (err) {
        return null;
    }
};

const mapDifficulty = (diff) => {
    const d = diff.toLowerCase();
    if (d.includes('easy')) return 'Easy';
    if (d.includes('medium')) return 'Medium';
    if (d.includes('hard') || d.includes('advanced') || d.includes('expert')) return 'Hard';
    return 'Unknown';
};

const seedHackerRank = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        console.log(`Processing ${hackerrankQuestions.length} HackerRank questions...`);

        let added = 0;
        let updated = 0;
        let skipped = 0;

        for (const q of hackerrankQuestions) {
            const slug = extractSlug(q.link);
            if (!slug) {
                console.warn(`Could not extract slug for: ${q.name}`);
                skipped++;
                continue;
            }

            const difficulty = mapDifficulty(q.difficulty);

            const result = await UniversalProblem.updateOne(
                { platform: 'hackerrank', slug: slug },
                { 
                    $set: { 
                        title: q.name, 
                        url: q.link,
                        platform: 'hackerrank',
                        difficulty: difficulty,
                        tags: q.tags || []
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
        console.log(`Total Processed: ${hackerrankQuestions.length}`);

    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
};

seedHackerRank();
