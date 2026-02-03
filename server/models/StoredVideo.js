const mongoose = require('mongoose');

const storedVideoSchema = new mongoose.Schema({
    questionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    videoId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    channelTitle: String,
    thumbnail: String,
    viewCount: Number,
    likeCount: Number,
    publishedAt: Date,
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Update lastUpdated on save
storedVideoSchema.pre('save', function(next) {
    this.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model('StoredVideo', storedVideoSchema);
