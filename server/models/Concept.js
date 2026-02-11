const mongoose = require('mongoose');

const conceptSchema = new mongoose.Schema({
    concept_key: { 
        type: String, 
        required: true, 
        unique: true, 
        uppercase: true,
        trim: true,
        helpText: "e.g., HASHMAP_PAIR_SUM" 
    },
    topic: { 
        type: String, 
        required: true,
        index: true,
        helpText: "e.g., Hashmap, DP, Graph" 
    },
    pattern: { 
        type: String,
        helpText: "e.g., Sliding Window, Two Pointer" 
    },
    difficulty_estimate: { 
        type: String, 
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Easy' 
    },
    intuition_text: { 
        type: String,
        helpText: "High-level mental model overview" 
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

conceptSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Concept = mongoose.models.Concept || mongoose.model('Concept', conceptSchema);

module.exports = Concept;
