const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const CompanyQuestion = require('./models/CompanyQuestion');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        const companies = await CompanyQuestion.aggregate([
            { $group: { _id: "$company" } },
            { $match: { _id: { $regex: "centure", $options: "i" } } }
        ]);
        
        console.log('Matching Companies:', JSON.stringify(companies, null, 2));
        mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

check();
