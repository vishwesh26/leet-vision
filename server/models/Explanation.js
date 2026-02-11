const mongoose = require('mongoose');

const explanationSchema = new mongoose.Schema({
    concept_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Concept',
        required: true,
        unique: true, // One explanation per concept
        index: true 
    },
    intuition: { 
        type: String, 
        helpText: "The breakthrough logic/aha moment" 
    },
    analytical_overview: String,
    examples: [{
        input: String,
        output: String,
        explanation: String
    }],
    complexity_table: [{
        method: String,
        time: String,
        space: String
    }],
    approaches: [{
        name: String,
        concept: String,
        steps: [String],
        complexity: {
            time: String,
            space: String
        },
        codes: {
            python: String,
            javascript: String,
            cpp: String,
            java: String
        }
    }],
    step_by_step: [{ 
        type: String,
        helpText: "Logical algorithm steps" 
    }],
    common_mistakes: [{ 
        type: String,
        helpText: "Common pitfalls or edge cases" 
    }],
    optimized_templates: [{
        language: String,
        code: String,
        explanation: String
    }],
    video_links: [{
        url: String,
        title: String,
        channel: String,
        views: Number,
        duration: String,
        thumbnail: String,
        rank: Number
    }],
    ai_generated: { 
        type: Boolean, 
        default: true 
    },
    verified: { 
        type: Boolean, 
        default: false 
    },
    updatedAt: { type: Date, default: Date.now }
});

explanationSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Explanation = mongoose.models.Explanation || mongoose.model('Explanation', explanationSchema);

module.exports = Explanation;
