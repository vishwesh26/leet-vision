const mongoose = require('mongoose');

const companyQuestionSchema = new mongoose.Schema({
    company: { type: String, required: true, index: true },
    title: { type: String, required: true },
    difficulty: { type: String, required: true },
    frequency: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 },
    topics: [String],
    leetcodeUrl: { type: String, required: true },
    questionId: { type: String, index: true }, // Optional: to link with our internal problems if needed
    updatedAt: { type: Date, default: Date.now }
});

// Compound index for uniqueness (per company)
companyQuestionSchema.index({ company: 1, leetcodeUrl: 1 }, { unique: true });

const CompanyQuestion = mongoose.models.CompanyQuestion || mongoose.model('CompanyQuestion', companyQuestionSchema);

module.exports = CompanyQuestion;
