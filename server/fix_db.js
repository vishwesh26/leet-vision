const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/leet-vision';

async function fix() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to DB");

        const Solution = mongoose.models.Solution || mongoose.model('Solution', new mongoose.Schema({
            questionId: String
        }));

        // Delete corrupt IDs
        const res1 = await Solution.deleteOne({ questionId: "1" });
        console.log("Deleted ID 1:", res1.deletedCount);

        const res2 = await Solution.deleteOne({ questionId: "2" });
        console.log("Deleted ID 2:", res2.deletedCount);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

fix();
