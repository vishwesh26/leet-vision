const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['single', 'bundle'],
        required: true
    },
    companies: [{
        type: String,
        required: true
    }],
    amount: {
        type: Number,
        required: true
    },
    razorpayOrderId: {
        type: String,
        required: true,
        unique: true
    },
    razorpayPaymentId: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Avoid duplicate unlocks (optional but safer)
purchaseSchema.index({ userId: 1, companies: 1 });

module.exports = mongoose.model('Purchase', purchaseSchema);
