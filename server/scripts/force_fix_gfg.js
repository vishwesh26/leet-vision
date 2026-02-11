const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const UniversalProblem = require('../models/UniversalProblem');

async function forceFix() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const fixes = [
            { 
                title: "Maximum sum of three stacks", 
                url: "https://www.geeksforgeeks.org/problems/find-maximum-equal-sum-of-three-stacks/1" 
            },
            { 
                title: "Activity Selection Problem", 
                url: "https://www.geeksforgeeks.org/problems/activity-selection-1587115620/1" 
            }
        ];

        for (const fix of fixes) {
            const result = await UniversalProblem.findOneAndUpdate(
                { title: fix.title, platform: 'geeksforgeeks' },
                { url: fix.url },
                { new: true }
            );
            if (result) {
                console.log(`Updated ${fix.title} to ${fix.url}`);
            } else {
                console.log(`Failed to find ${fix.title}`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

forceFix();
