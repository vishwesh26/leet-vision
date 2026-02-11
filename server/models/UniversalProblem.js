const mongoose = require('mongoose');

const universalProblemSchema = new mongoose.Schema({
    platform: { 
        type: String, 
        required: true, 
        enum: ['leetcode', 'hackerrank', 'geeksforgeeks', 'codechef', 'other'],
        index: true 
    },
    title: { 
        type: String, 
        required: true,
        trim: true 
    },
    slug: { 
        type: String, 
        required: true,
        index: true 
    },
    url: { 
        type: String, 
        required: true 
    },
    questionId: {
        type: String,
        required: false,
        index: true
    },
    concept_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Concept',
        required: false,
        index: true 
    },
    tags: [String],
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard', 'Unknown'],
        default: 'Unknown',
        index: true
    },
    last_seen_at: { 
        type: Date, 
        default: Date.now 
    }
});

// Ensure unique problem per platform
universalProblemSchema.index({ platform: 1, slug: 1 }, { unique: true });

const UniversalProblem = mongoose.models.UniversalProblem || mongoose.model('UniversalProblem', universalProblemSchema);

module.exports = UniversalProblem;
