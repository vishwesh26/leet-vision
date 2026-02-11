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
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null/undefined values
    },
    avatar: {
        type: String
    },
    passwordHash: {
        type: String,
        required: function() {
            return !this.googleId; // Required ONLY if Google ID is missing
        },
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
    }],
    isAdmin: {
        type: Boolean,
        default: false
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
