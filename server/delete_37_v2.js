const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const deleteSolution = async () => {
    const uri = process.env.MONGODB_URI;
    try {
        await mongoose.connect(uri);
        const Solution = mongoose.models.Solution || mongoose.model('Solution', new mongoose.Schema({}, { strict: false }));
        
        // Try deleting as string
        let result = await Solution.deleteOne({ questionId: '37' });
        console.log(`String delete result: ${result.deletedCount}`);
        
        if (result.deletedCount === 0) {
            // Try deleting as number
            result = await Solution.deleteOne({ questionId: 37 });
            console.log(`Number delete result: ${result.deletedCount}`);
        }

        // Try searching for the 37th item if both fail?
        // No, let's not assume that yet.

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

deleteSolution();
