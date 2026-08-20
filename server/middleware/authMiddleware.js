const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret_keep_it_safe';

exports.protect = async (req, res, next) => {
    try {
        let token;
        
        // 1. Get token from headers or cookies
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return res.status(401).json({ status: 'fail', message: 'You are not logged in' });
        }

        // 2. Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // 3. Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({ status: 'fail', message: 'User no longer exists' });
        }

        // 4. Grant access and attach user to request
        req.user = currentUser;
        next();
    } catch (err) {
        res.status(401).json({ status: 'fail', message: 'Invalid token or session expired' });
    }
};

exports.optionalAuth = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) return next();

        const decoded = jwt.verify(token, JWT_SECRET);
        const currentUser = await User.findById(decoded.id);
        
        if (currentUser) {
            req.user = currentUser;
        }
        next();
    } catch (err) {
        // Just proceed without setting req.user
        next();
    }
};

exports.admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ status: 'fail', message: 'Not authorized as an admin' });
    }
};
