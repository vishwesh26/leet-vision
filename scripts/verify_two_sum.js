const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' }); // Adjust path if needed

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/leet-vision';

async function verify() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to DB");

        const Solution = mongoose.models.Solution || mongoose.model('Solution', new mongoose.Schema({
            questionId: String,
            title: String,
            approaches: Array
        }));

        const doc = await Solution.findOne({ questionId: "1" });
        if (doc) {
            console.log("✅ FOUND Two Sum!");
            console.log("Title:", doc.title);
            console.log("Approaches Count:", doc.approaches ? doc.approaches.length : 0);
            if (doc.approaches && doc.approaches.length > 0) {
                console.log("Sample Approach Name:", doc.approaches[0].name);
            }
        } else {
            console.log("❌ NOT FOUND. Two Sum (ID: 1) is NOT in the database.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
