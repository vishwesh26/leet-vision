const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const deleteBySlug = async () => {
    const uri = process.env.MONGODB_URI;
    try {
        await mongoose.connect(uri);
        const Solution = mongoose.models.Solution || mongoose.model('Solution', new mongoose.Schema({}, { strict: false }));
        
        // Search by questionId 37 again just to be super sure
        const res1 = await Solution.deleteOne({ questionId: "37" });
        console.log(`Deleted by questionId '37': ${res1.deletedCount}`);

        // Search by title containing Sudoku just in case
        const res2 = await Solution.deleteOne({ title: /Sudoku/i });
        console.log(`Deleted by title 'Sudoku': ${res2.deletedCount}`);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

deleteBySlug();
