const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Concept = require('./models/Concept');
const Explanation = require('./models/Explanation');
const UniversalProblem = require('./models/UniversalProblem');

async function checkDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const title = "Counting Bits";
        const slugify = require('slugify');
        const conceptKey = slugify(title, { replacement: '_', lower: true, strict: true }).toUpperCase();
        console.log(`Checking for Concept Key: ${conceptKey}`);

        const concept = await Concept.findOne({ concept_key: conceptKey });
        if (concept) {
            console.log("Found Concept:", concept);
            const explanation = await Explanation.findOne({ concept_id: concept._id });
            console.log("Found Explanation:", explanation);
        } else {
            console.log("Concept NOT found.");
        }

        const problem = await UniversalProblem.findOne({ title: "Counting Bits" });
        console.log("Found Problem Mapping:", problem);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDB();
