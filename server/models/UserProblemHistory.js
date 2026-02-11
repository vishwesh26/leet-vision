const mongoose = require('mongoose');

const userProblemHistorySchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true,
        index: true 
    },
    problem_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'UniversalProblem',
        required: true,
        index: true 
    },
    viewed: { 
        type: Boolean, 
        default: true 
    },
    solved_detected: { 
        type: Boolean, 
        default: false 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});

// Unique history entry per user/problem
userProblemHistorySchema.index({ user_id: 1, problem_id: 1 }, { unique: true });

const UserProblemHistory = mongoose.models.UserProblemHistory || mongoose.model('UserProblemHistory', userProblemHistorySchema);

module.exports = UserProblemHistory;
