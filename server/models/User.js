const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    passwordHash: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false // Don't return password hash by default
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Future scalability:
    isPremium: {
        type: Boolean,
        default: false
    },
    purchasedPlans: [{
        type: String // List of plan IDs or company names
    }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
