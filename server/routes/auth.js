const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Purchase = require('../models/Purchase');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_keep_it_safe';
const JWT_EXPIRES_IN = '30d';
const passport = require('passport');

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
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const redirectUrl = frontendUrl.endsWith('/') ? frontendUrl : `${frontendUrl}/`;
            
        res.redirect(redirectUrl);
    }
);

// Sign Up
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 'fail', message: 'User with this email already exists' });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Create user
        const newUser = await User.create({
            name,
            email,
            passwordHash
        });

        // 4. Generate token
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
router.post('/login', async (req, res) => {
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
                    ownedCompanies
                }
            }
        });
    } catch (err) {
        res.status(401).json({ status: 'fail', message: 'Invalid token' });
    }
});

module.exports = router;
