const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Purchase = require('../models/Purchase');
const OTP = require('../models/OTP');
const sendEmail = require('../utils/email.js');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_keep_it_safe';
const JWT_EXPIRES_IN = '30d';
const passport = require('passport');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

// Helper to create token
const signToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

// Google Auth Routes
router.get('/google', (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return res.status(400).send('Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.');
    }
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return res.redirect('/login?error=oauth_not_configured');
    }
    passport.authenticate('google', { failureRedirect: '/login', session: false })(req, res, next);
}, (req, res) => {
        // Successful authentication
        const token = signToken(req.user._id);
        
        // Send cookie
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax'
        });

        // Redirect to frontend (homepage or dashboard)
        const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'https://leet-vision.vercel.app' : 'http://localhost:5173');
        const redirectUrl = frontendUrl.endsWith('/') ? frontendUrl : `${frontendUrl}/`;
        
        console.log(`[OAuth Callback] Redirecting to: ${redirectUrl} (NODE_ENV: ${process.env.NODE_ENV}, FRONTEND_URL_SET: ${!!process.env.FRONTEND_URL})`);
            
        res.redirect(redirectUrl);
    }
);

// Send OTP
router.post('/send-otp', otpLimiter, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ status: 'fail', message: 'Please provide an email' });
        }

        // Stateful DB Cooldown Check to prevent spamming the same email
        const existingOtp = await OTP.findOne({ email });
        if (existingOtp) {
            const timePassed = Date.now() - new Date(existingOtp.createdAt).getTime();
            const cooldown = 60000; // 60 seconds
            if (timePassed < cooldown) {
                const secondsLeft = Math.ceil((cooldown - timePassed) / 1000);
                return res.status(429).json({
                    status: 'fail',
                    message: `Please wait ${secondsLeft} seconds before requesting another code.`
                });
            }
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 'fail', message: 'User with this email already exists' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to DB
        await OTP.findOneAndUpdate(
            { email },
            { otp, createdAt: Date.now() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Send Email
        try {
            await sendEmail({
                email,
                subject: 'Your LeetVision Verification Code',
                message: `Your verification code is ${otp}. It will expire in 10 minutes.`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                        <h2 style="color: #f57c00; text-align: center;">LeetVision Verification</h2>
                        <p>Hi there,</p>
                        <p>Welcome to LeetVision! Use the code below to verify your email and complete your signup:</p>
                        <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333; border-radius: 5px; margin: 20px 0;">
                            ${otp}
                        </div>
                        <p>This code will expire in 10 minutes.</p>
                        <p>If you didn't request this code, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #888; text-align: center;">© 2026 LeetVision. Built for the Bold.</p>
                    </div>
                `
            });

            res.status(200).json({ status: 'success', message: 'OTP sent to your email' });
        } catch (emailErr) {
            console.error('Email sending failed:', emailErr);
            // In development, if email fails, we might still want to know the OTP for testing
            if (process.env.NODE_ENV !== 'production') {
                return res.status(500).json({ 
                    status: 'error', 
                    message: 'Failed to send email. Check your .env config.',
                    debugOtp: otp // ONLY for dev
                });
            }
            res.status(500).json({ status: 'error', message: 'Failed to send OTP email' });
        }

    } catch (err) {
        console.error('Send OTP Error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Sign Up
router.post('/signup', authLimiter, async (req, res) => {
    try {
        const { name, email, password, otp } = req.body;

        // 1. Verify OTP
        if (!otp) {
            return res.status(400).json({ status: 'fail', message: 'Please provide the verification code' });
        }

        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ status: 'fail', message: 'Invalid or expired verification code' });
        }

        // 2. Check if user already exists (extra safety)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 'fail', message: 'User with this email already exists' });
        }

        // 3. Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 4. Create user
        const newUser = await User.create({
            name,
            email,
            passwordHash
        });

        // 5. Delete OTP record after successful signup
        await OTP.deleteOne({ _id: otpRecord._id });

        // 6. Send Welcome Email (Non-blocking)
        sendEmail({
            email: newUser.email,
            subject: 'Welcome to LeetVision! 🚀 Your Journey Starts Now',
            message: `Hi ${newUser.name}, welcome to LeetVision! We're excited to help you conquer your DSA preparation.`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; border: 1px solid #e0e0e0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
                    <div style="background: linear-gradient(135deg, #f57c00 0%, #ff9800 100%); padding: 40px 20px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Welcome to LeetVision, ${newUser.name.split(' ')[0]}!</h1>
                        <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 16px;">The future of your tech career starts here.</p>
                    </div>
                    
                    <div style="padding: 30px 40px;">
                        <p style="font-size: 16px; color: #444; line-height: 1.6;">
                            We're absolutely thrilled to have you on board! You've just taken a massive step towards mastering data structures and algorithms.
                        </p>
                        
                        <div style="margin: 30px 0; background: #fff8f1; border-radius: 12px; padding: 20px;">
                            <h3 style="color: #e65100; margin-top: 0;">What's next for you?</h3>
                            <ul style="padding-left: 20px; color: #555; line-height: 1.8;">
                                <li><strong>Explore All Platform Problems</strong>: Access curated problems from LeetCode, HackerRank, and more.</li>
                                <li><strong>Curated Solutions</strong>: Get high-quality, step-by-step explanations for every problem.</li>
                                <li><strong>Track Progress</strong>: Connect your LeetCode account to see your growth in real-time.</li>
                            </ul>
                        </div>

                        <div style="text-align: center; margin: 35px 0;">
                            <a href="https://leet-vision.vercel.app" style="background-color: #f57c00; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(245, 124, 0, 0.3);">Start Solving Now</a>
                        </div>

                        <p style="font-size: 14px; color: #666; font-style: italic; text-align: center;">
                            "The best way to predict the future is to create it." - Let's build yours together.
                        </p>
                    </div>

                    <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                        <p style="font-size: 12px; color: #999; margin: 0;">
                            © 2026 LeetVision. Built with ❤️ for the Bold.<br>
                            If you have any questions, just hit reply!
                        </p>
                    </div>
                </div>
            `
        }).catch(err => console.error('Welcome email failed:', err));

        // 7. Generate token
        const token = signToken(newUser._id);

        // 5. Send cookie (HttpOnly)
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax'
        });

        // 6. Return response (excluding passwordHash)
        res.status(201).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    ownedCompanies: [] // New user has no purchases
                }
            }
        });
    } catch (err) {
        console.error('Signup Error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Login
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate inputs
        if (!email || !password) {
            return res.status(400).json({ status: 'fail', message: 'Please provide email and password' });
        }

        // 2. Find user & include password hash
        const user = await User.findOne({ email }).select('+passwordHash');
        
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
        }

        // 3. Generate token
        const token = signToken(user._id);

        // 4. Send cookie
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax'
        });

        // Create specialized list of owned companies
        const purchases = await Purchase.find({ userId: user._id });
        const ownedCompanies = [...new Set(purchases.flatMap(p => p.companies))];

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    ownedCompanies
                }
            }
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Logout
router.get('/logout', (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
});

// Get Me (Current User)
router.get('/me', async (req, res) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return res.status(401).json({ status: 'fail', message: 'You are not logged in' });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({ status: 'fail', message: 'User no longer exists' });
        }

        // Get owned companies
        const purchases = await Purchase.find({ userId: currentUser._id });
        const ownedCompanies = [...new Set(purchases.flatMap(p => p.companies))];

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: currentUser._id,
                    name: currentUser.name,
                    email: currentUser.email,
                    isAdmin: currentUser.isAdmin,
                    subscriptionExpiry: currentUser.subscriptionExpiry,
                    subscriptionType: currentUser.subscriptionType,
                    ownedCompanies
                }
            }
        });
    } catch (err) {
        res.status(401).json({ status: 'fail', message: 'Invalid token' });
    }
});

module.exports = router;
