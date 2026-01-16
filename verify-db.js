require('dotenv').config({ path: './api/.env' });
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
console.log("Testing Connection to:", uri.replace(/:([^:@]+)@/, ':****@')); // Hide password

async function testConnection() {
    try {
        console.log("Connecting...");
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log("✅ MongoDB Connected Successfully!");

        const Solution = mongoose.model('Solution', new mongoose.Schema({
            questionId: String,
            title: String
        }), 'solutions');

        const testId = 'TEST_DB_WRITE_' + Date.now();
        console.log(`Attempting to write document with ID: ${testId}`);
        
        await Solution.create({
            questionId: testId,
            title: "Test Entry from Script"
        });
        console.log("✅ Write Successful!");

        const found = await Solution.findOne({ questionId: testId });
        if (found) {
            console.log("✅ Read Successful: Found document.");
            await Solution.deleteOne({ questionId: testId });
            console.log("✅ Cleanup Successful.");
        } else {
            console.error("❌ Write reported success, but Read failed (Document not found).");
        }

    } catch (err) {
        console.error("❌ Connection or Operation Failed:");
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

testConnection();
