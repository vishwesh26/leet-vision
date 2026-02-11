const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config();

const CompanyQuestion = require('./models/CompanyQuestion');

async function getTopCompanies() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const companies = await CompanyQuestion.aggregate([
            { $group: { _id: '$company', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 100 }
        ]);
        console.log(JSON.stringify(companies.map(c => c._id), null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

getTopCompanies();
