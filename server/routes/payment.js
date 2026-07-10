const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const auth = require('../middleware/authMiddleware');
const Purchase = require('../models/Purchase');

let razorpay;
try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.warn('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing. Payment features will be disabled.');
    } else {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
} catch (err) {
    console.error('Failed to initialize Razorpay:', err);
}

// Pricing
const PRICES = {
    single: 50,
    bundle: 300,
    monthly_sub: 50,
    yearly_sub: 500
};

// ... (BUNDLE_COMPANIES remains same)

// API 1: Create Order
router.post('/create-order', auth.protect, async (req, res) => {
    if (!razorpay) {
        return res.status(503).json({ status: 'error', message: 'Payment gateway is not configured' });
    }
    try {
        const { type, company } = req.body;
        
        if (!type) {
            return res.status(400).json({ status: 'error', message: 'Missing payment details' });
        }

        let amount;
        if (type === 'coffee') {
            amount = Number(req.body.amount);
            if (isNaN(amount) || amount < 10) {
                return res.status(400).json({ status: 'error', message: 'Please provide a valid amount (minimum ₹10)' });
            }
        } else {
            amount = PRICES[type];
            if (!amount) {
                return res.status(400).json({ status: 'error', message: 'Invalid plan type' });
            }
        }

        // Check if user already has an active subscription if buying one
        if (type === 'coffee') {
            // No ownership check needed for coffee donations
        } else if (type.includes('_sub')) {
            if (req.user.subscriptionExpiry && req.user.subscriptionExpiry > Date.now()) {
                // Allow renewal? Or block if too far out? Let's allow renewal (extension)
            }
        } else {
            // Check if user already owns this company or bundle
            const existing = await Purchase.findOne({
                userId: req.user._id,
                companies: type === 'single' ? company : { $all: BUNDLE_COMPANIES }
            });

            if (existing) {
                return res.status(400).json({ status: 'error', message: 'You already own this content' });
            }
        }

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.json({
            status: 'success',
            data: {
                orderId: order.id,
                amount: order.amount,
                keyId: process.env.RAZORPAY_KEY_ID,
                currency: order.currency,
                type,
                company
            }
        });
    } catch (err) {
        console.error('Order creation error:', err);
        res.status(500).json({ status: 'error', message: 'Payment initialization failed' });
    }
});

// API 2: Verify Payment
router.post('/verify', auth.protect, async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            type,
            company 
        } = req.body;

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            const User = require('../models/User');
            const sendEmail = require('../utils/email');
            
            // ... (idempotency check remains same)
            const existingPurchase = await Purchase.findOne({ razorpayPaymentId: razorpay_payment_id });
            if (existingPurchase) {
                return res.json({ 
                    status: 'success', 
                    message: "Payment already verified",
                    data: { subscriptionExpiry: req.user.subscriptionExpiry }
                });
            }

            let amount;
            if (type === 'coffee') {
                amount = Number(req.body.amount);
            } else {
                amount = PRICES[type];
            }

            if (type === 'coffee') {
                const purchase = new Purchase({
                    userId: req.user._id,
                    type: 'coffee',
                    companies: ['coffee_donation'],
                    amount,
                    razorpayOrderId: razorpay_order_id,
                    razorpayPaymentId: razorpay_payment_id
                });
                await purchase.save();

                // Send Confirmation Email
                try {
                    await sendEmail({
                        email: req.user.email,
                        subject: `Thank you for buying me a coffee! ☕`,
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                <h2 style="color: #ffa116;">Thank you so much!</h2>
                                <p>Hello <b>${req.user.name}</b>,</p>
                                <p>I really appreciate your support. Your coffee contribution of <b>₹${amount}</b> helps keep Leet-Vision alive and running!</p>
                                <p>It took me many late nights to build this project, and knowing it helped you makes all the effort worth it.</p>
                                <p>Have a wonderful day and happy coding!</p>
                                <p style="margin-top: 30px; font-size: 0.8rem; color: #777;">Leet-Vision Developer</p>
                            </div>
                        `
                    });
                } catch (emailErr) {
                    console.error("Post-coffee email failed:", emailErr);
                }

                return res.json({ 
                    status: 'success', 
                    message: "Thank you for buying me a coffee!",
                    data: { amount }
                });
            } else if (type.includes('_sub')) {
                // Subscription Logic
                const days = type === 'monthly_sub' ? 30 : 365;
                const currentExpiry = req.user.subscriptionExpiry && req.user.subscriptionExpiry > Date.now() 
                    ? req.user.subscriptionExpiry 
                    : new Date();
                
                const newExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);

                const purchase = new Purchase({
                    userId: req.user._id,
                    type: type,
                    companies: ['ALL_PLATFORMS', 'ALL_COMPANIES'],
                    amount,
                    razorpayOrderId: razorpay_order_id,
                    razorpayPaymentId: razorpay_payment_id
                });
                await purchase.save();

                await User.findByIdAndUpdate(req.user._id, {
                    subscriptionExpiry: newExpiry,
                    subscriptionType: type === 'monthly_sub' ? 'monthly' : 'yearly',
                    isPremium: true
                });

                // Send Confirmation Email
                try {
                    await sendEmail({
                        email: req.user.email,
                        subject: `Your LeetVision Premium is Active! 🚀`,
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                <h2 style="color: #ffa116;">Subscription Activated!</h2>
                                <p>Hello <b>${req.user.name}</b>,</p>
                                <p>Thank you for choosing LeetVision Premium. Your <b>${type.replace('_', ' ')}</b> has been successfully activated.</p>
                                <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 0;"><b>Plan:</b> ${type === 'monthly_sub' ? 'Monthly Pro' : 'Yearly Master'}</p>
                                    <p style="margin: 0;"><b>Amount Paid:</b> ₹${amount}</p>
                                    <p style="margin: 0;"><b>Expires On:</b> ${newExpiry.toLocaleDateString()}</p>
                                </div>
                                <p>You now have full access to all platform solutions, premium video content, and advanced analytical insights.</p>
                                <a href="https://leet-vision.vercel.app/explore" style="display: inline-block; padding: 10px 20px; background: #ffa116; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Exploring</a>
                                <p style="margin-top: 30px; font-size: 0.8rem; color: #777;">If you have any questions, reply to this email.</p>
                            </div>
                        `
                    });
                } catch (emailErr) {
                    console.error("Post-purchase email failed:", emailErr);
                }

                return res.json({ 
                    status: 'success', 
                    message: "Subscription activated successfully",
                    data: { subscriptionExpiry: newExpiry }
                });

            } else {
                // Existing Single/Bundle Logic
                const companies = type === 'single' ? [company] : BUNDLE_COMPANIES;
                const purchase = new Purchase({
                    userId: req.user._id,
                    type,
                    companies,
                    amount,
                    razorpayOrderId: razorpay_order_id,
                    razorpayPaymentId: razorpay_payment_id
                });

                await purchase.save();

                // Send Confirmation Email
                try {
                    await sendEmail({
                        email: req.user.email,
                        subject: `Content Unlocked: ${type === 'single' ? company : 'Universal Bundle'} 🔓`,
                        html: `
                            <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                <h2 style="color: #ffa116;">Purchase Successful!</h2>
                                <p>Hello <b>${req.user.name}</b>,</p>
                                <p>You have successfully unlocked <b>${type === 'single' ? company : 'the Universal Bundle'}</b>.</p>
                                <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 0;"><b>Type:</b> ${type}</p>
                                    <p style="margin: 0;"><b>Content:</b> ${companies.join(', ')}</p>
                                    <p style="margin: 0;"><b>Amount Paid:</b> ₹${amount}</p>
                                </div>
                                <p>Dive into the solutions and master your coding interviews!</p>
                                <a href="https://leet-vision.vercel.app/explore" style="display: inline-block; padding: 10px 20px; background: #ffa116; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
                                <p style="margin-top: 30px; font-size: 0.8rem; color: #777;">Happy Leeting!</p>
                            </div>
                        `
                    });
                } catch (emailErr) {
                    console.error("Post-purchase email failed:", emailErr);
                }

                return res.json({ 
                    status: 'success', 
                    message: "Content unlocked successfully",
                    data: { companies }
                });
            }
        }
 else {
            return res.status(400).json({ status: 'error', message: "Invalid payment signature" });
        }
    } catch (err) {
        console.error('Payment verification error:', err);
        res.status(500).json({ status: 'error', message: "Internal Server Error" });
    }
});

module.exports = router;
