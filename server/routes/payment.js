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
    bundle: 300
};

// Top bundle companies (Top 100)
const BUNDLE_COMPANIES = [
  "Amazon", "DE Shaw", "IBM", "Nvidia", "Walmart Labs", "Infosys", "PayPal", "Microsoft", "Yandex", "Meta",
  "Bloomberg", "Uber", "Snap", "Salesforce", "Citadel", "Flipkart", "Apple", "Oracle", "Zoho", "Google",
  "Accenture", "Goldman Sachs", "Adobe", "LinkedIn", "tcs", "Yahoo", "TikTok", "PhonePe", "Snowflake", "DoorDash",
  "Cisco", "Visa", "ServiceNow", "J.P. Morgan", "eBay", "Atlassian", "Intuit", "Samsung", "ByteDance", "Nutanix",
  "Airbnb", "Wix", "Roblox", "X", "Morgan Stanley", "Coupang", "Pinterest", "Expedia", "Qualcomm", "Capital One",
  "Tesla", "EPAM Systems", "Turing", "Sprinklr", "Agoda", "SAP", "Media.net", "Netflix", "Arista Networks", "Rubrik",
  "Databricks", "Docusign", "Anduril", "Tinkoff", "Swiggy", "Autodesk", "Zepto", "Paytm", "Deutsche Bank", "Yelp",
  "MakeMyTrip", "MathWorks", "Cognizant", "Palantir Technologies", "Deloitte", "Grammarly", "Palo Alto Networks", "Lyft", "Capgemini", "Wipro",
  "Intel", "Dropbox", "Siemens", "ZScaler", "Zomato", "Wayfair", "American Express", "HashedIn", "Akuna Capital", "Two Sigma",
  "josh technology", "Myntra", "BNY Mellon", "Zeta", "Zenefits", "Geico", "VMware", "Datadog", "Arcesium", "Tekion"
];

// API 1: Create Order
router.post('/create-order', auth.protect, async (req, res) => {
    if (!razorpay) {
        return res.status(503).json({ status: 'error', message: 'Payment gateway is not configured' });
    }
    try {
        const { type, company } = req.body;
        
        if (!type || (type === 'single' && !company)) {
            return res.status(400).json({ status: 'error', message: 'Missing payment details' });
        }

        const amount = PRICES[type];
        if (!amount) {
            return res.status(400).json({ status: 'error', message: 'Invalid plan type' });
        }

        // Check if user already owns this
        const existing = await Purchase.findOne({
            userId: req.user._id,
            companies: type === 'single' ? company : { $all: BUNDLE_COMPANIES }
        });

        if (existing) {
            return res.status(400).json({ status: 'error', message: 'You already own this content' });
        }

        const options = {
            amount: amount * 100, // amount in the smallest currency unit (paise)
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
            // Signature verified
            const companies = type === 'single' ? [company] : BUNDLE_COMPANIES;
            const amount = PRICES[type];

            // Save to DB
            const purchase = new Purchase({
                userId: req.user._id,
                type,
                companies,
                amount,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id
            });

            await purchase.save();

            return res.json({ 
                status: 'success', 
                message: "Payment verified successfully",
                data: { companies }
            });
        } else {
            return res.status(400).json({ status: 'error', message: "Invalid payment signature" });
        }
    } catch (err) {
        console.error('Payment verification error:', err);
        res.status(500).json({ status: 'error', message: "Internal Server Error" });
    }
});

module.exports = router;
