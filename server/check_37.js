const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const checkSolution = async () => {
    const uri = process.env.MONGODB_URI;
    try {
        await mongoose.connect(uri);
        const Solution = mongoose.models.Solution || mongoose.model('Solution', new mongoose.Schema({}, { strict: false }));
        
        const solution = await Solution.findOne({ questionId: '37' });
        if (solution) {
            console.log("Found Solution for 37:", solution.title);
        } else {
            console.log("Solution 37 not found.");
            // Try searching for title containing 37 or something?
            const partial = await Solution.findOne({ title: /37/ });
            if (partial) console.log("Found solution with 37 in title:", partial.title, "ID:", partial.questionId);
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

checkSolution();
