const mongoose = require('mongoose');

const sponsorInquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Contact person name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Work email is required'],
        trim: true,
        lowercase: true
    },
    companyName: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    websiteUrl: {
        type: String,
        trim: true,
        default: ''
    },
    placement: {
        type: String,
        default: 'Homepage Hero Banner'
    },
    budget: {
        type: String,
        default: '$500 - $1,000 / month'
    },
    message: {
        type: String,
        required: [true, 'Please provide details or goals for your sponsorship'],
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'contacted', 'closed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SponsorInquiry', sponsorInquirySchema);
