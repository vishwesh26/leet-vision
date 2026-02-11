const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const slugify = require('slugify');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const UniversalProblemSchema = new mongoose.Schema({
    platform: String,
    title: String,
    slug: String,
    url: String,
    difficulty: String,
    tags: [String]
});

// Check if model already exists before compiling
const UniversalProblem = mongoose.models.UniversalProblem || mongoose.model('UniversalProblem', UniversalProblemSchema);

// Import the Master List
const curatedData = require('./gfg_master_list');

const replace = async () => {
    try {
        console.log('Connecting to MongoDB...');
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in the environment variables.');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        console.log('Deleting all existing GeeksforGeeks entries...');
        const delResult = await UniversalProblem.deleteMany({ platform: 'geeksforgeeks' });
        console.log(`Deleted ${delResult.deletedCount} existing entries.`);

        console.log(`Seeding ${curatedData.length} new entries from the master list...`);

        let createdCount = 0;
        let skippedCount = 0;

        for (const data of curatedData) {
            // Generate slug from title
            const finalSlug = slugify(data.title, { lower: true, strict: true });
            
            // Check for duplicates (shouldn't be any since we cleared the DB, but good for safety)
            const existing = await UniversalProblem.findOne({ platform: 'geeksforgeeks', slug: finalSlug });

            if (!existing) {
                await UniversalProblem.create({
                    platform: 'geeksforgeeks',
                    title: data.title,
                    slug: finalSlug,
                    url: data.url // Use exact URL provided
                });
                createdCount++;
            } else {
                skippedCount++;
            }
        }

        console.log(`\nReplacement complete!`);
        console.log(`Created: ${createdCount}`);
        console.log(`Skipped (Duplicate Slug): ${skippedCount}`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    } catch (error) {
        console.error('Replacement failed:', error);
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        process.exit(1);
    }
};

replace();
