require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
console.log("Target URI:", uri.split('?')[0]); // Log URI without params for verification

async function runManualCheck() {
    try {
        await mongoose.connect(uri);
        console.log("✅ Database Connected.");

        // Define Model targeting 'solutions' collection
        const Solution = mongoose.model('Solution', new mongoose.Schema({
            questionId: String,
            title: String,
            approaches: Array
        }), 'solutions');

        const dummyId = "DUMMY_VERIFY_" + Math.floor(Math.random() * 1000);
        
        console.log(`Creating Document with ID: ${dummyId}...`);
        await Solution.create({
            questionId: dummyId,
            title: "Manual Verification Entry",
            approaches: [{ name: "Test Approach", algorithm: ["Step 1"] }]
        });

        console.log("✅ Document INSERTED successfully.");
        console.log("Please check your MongoDB Atlas Collection 'solutions' now.");
        console.log(`Look for questionId: "${dummyId}"`);

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

runManualCheck();
