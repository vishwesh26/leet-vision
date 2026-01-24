const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const listSolutions = async () => {
    const uri = process.env.MONGODB_URI;

    try {
        await mongoose.connect(uri);
        const Solution = mongoose.models.Solution || mongoose.model('Solution', new mongoose.Schema({}, { strict: false }));
        
        const count = await Solution.countDocuments();
        console.log(`Total Solutions in DB: ${count}`);

        const solutions = await Solution.find({}, { questionId: 1 }).limit(10);
        console.log("Sample Question IDs in DB:", solutions.map(s => s.questionId));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

listSolutions();
