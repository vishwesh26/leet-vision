const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const deleteSolution = async () => {
    const questionId = '37';
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        console.error("MONGODB_URI not found in environment variables.");
        process.exit(1);
    }

    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB.");

        const solutionSchema = new mongoose.Schema({
            questionId: { type: String, required: true, unique: true }
        }, { strict: false });

        const Solution = mongoose.models.Solution || mongoose.model('Solution', solutionSchema);

        const result = await Solution.deleteOne({ questionId: questionId });

        if (result.deletedCount > 0) {
            console.log(`Successfully deleted solution for questionId: ${questionId}`);
        } else {
            console.log(`No solution found for questionId: ${questionId}`);
        }

    } catch (err) {
        console.error("Error during deletion:", err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

deleteSolution();
