const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const slugify = require('slugify');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const UniversalProblem = require('../models/UniversalProblem');

async function migrateLinks() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const gfgProblems = await UniversalProblem.find({ platform: 'geeksforgeeks' });
        console.log(`Found ${gfgProblems.length} GFG problems to update.`);

        let updatedCount = 0;
        for (const problem of gfgProblems) {
            const slug = slugify(problem.title, { lower: true, strict: true });
            const newUrl = `https://www.geeksforgeeks.org/dsa/${slug}/`;
            
            if (problem.url !== newUrl) {
                problem.url = newUrl;
                await problem.save();
                updatedCount++;
            }
        }

        console.log(`Migration complete! Updated ${updatedCount} links.`);
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrateLinks();
