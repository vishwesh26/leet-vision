const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const UniversalProblem = require('./models/UniversalProblem');

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const sample1 = await UniversalProblem.findOne({ title: "Counting Bits", platform: "geeksforgeeks" });
        console.log("Counting Bits URL:", sample1 ? sample1.url : "Not Found");

        const sample2 = await UniversalProblem.findOne({ title: "Policemen catch thieves", platform: "geeksforgeeks" });
        console.log("Policemen catch thieves URL:", sample2 ? sample2.url : "Not Found");

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
