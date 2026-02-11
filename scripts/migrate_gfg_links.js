const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const slugify = require('slugify');

dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

const UniversalProblemSchema = new mongoose.Schema({
    platform: String,
    title: String,
    slug: String,
    url: String
}, { strict: false });

const UniversalProblem = mongoose.model('UniversalProblem', UniversalProblemSchema, 'universalproblems');

async function migrate() {
    try {
        console.log("Connecting to:", process.env.MONGODB_URI.split('@')[1] || "MongoDB");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const gfgProblems = await UniversalProblem.find({ platform: 'geeksforgeeks' });
        console.log(`Found ${gfgProblems.length} GFG problems to audit.`);

        let updatedCount = 0;
        for (const problem of gfgProblems) {
            const slug = problem.slug || slugify(problem.title, { lower: true, strict: true });
            const expectedUrl = `https://www.geeksforgeeks.org/problems/${slug}/1`;

            if (problem.url !== expectedUrl) {
                console.log(`Updating ${problem.title}:`);
                console.log(`  Old: ${problem.url}`);
                console.log(`  New: ${expectedUrl}`);
                
                problem.url = expectedUrl;
                await problem.save();
                updatedCount++;
            }
        }

        console.log(`\nMigration complete! Total updated: ${updatedCount}`);
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
