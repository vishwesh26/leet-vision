const mongoose = require('mongoose');
const UniversalProblem = require('../models/UniversalProblem');
const Concept = require('../models/Concept');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        const platforms = ['hackerrank', 'geeksforgeeks', 'codechef'];

        for (const platform of platforms) {
            console.log(`\n--- Checking ${platform} ---`);
            const problem = await UniversalProblem.findOne({ platform }).populate('concept_id');
            if (problem) {
                console.log('Title:', problem.title);
                console.log('Concept:', problem.concept_id);
                console.log('Tags:', problem.tags);
            } else {
                console.log('No problems found.');
            }
        }

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
