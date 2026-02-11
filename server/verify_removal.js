const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Concept = require('./models/Concept');
const Explanation = require('./models/Explanation');

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const concept = await Concept.findOne({ concept_key: "TWO_SUM" });
        console.log("Two Sum Concept intuition_text:", concept.intuition_text);

        const explanation = await Explanation.findOne({ concept_id: concept._id });
        console.log("Two Sum Explanation intuition:", explanation.intuition);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
