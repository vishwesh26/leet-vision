const mongoose = require('mongoose');

const surveyResponseSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        default: "Would you pay for Top 100 companies interview question bundles?"
    },
    response: {
        type: String,
        required: true,
        enum: ['Yes', 'No', 'Maybe']
    },
    pricePoint: {
        type: String,
        default: "N/A"
    },
    userId: {
        type: String,
        default: "guest"
    },
    ip: String,
    userAgent: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SurveyResponse', surveyResponseSchema);
