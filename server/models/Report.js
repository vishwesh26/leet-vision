const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    questionId: { type: String, required: true },
    title: { type: String, required: true },
    platform: { type: String, default: 'LeetCode' },
    reason: { type: String, required: true },
    details: { type: String },
    correctSolution: { type: String }, // Optional: If user provides a better solution
    status: { type: String, default: 'open', enum: ['open', 'reviewed', 'resolved'] },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);
