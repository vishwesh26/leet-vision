const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const listAll = async () => {
    const uri = process.env.MONGODB_URI;
    try {
        await mongoose.connect(uri);
        const Solution = mongoose.models.Solution || mongoose.model('Solution', new mongoose.Schema({}, { strict: false }));
        
        const solutions = await Solution.find({}, { questionId: 1, title: 1 }).lean();
        console.log("All IDs in DB:", solutions.map(s => s.questionId).join(', '));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

listAll();
