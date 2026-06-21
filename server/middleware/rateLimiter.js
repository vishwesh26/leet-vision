const rateLimit = require('express-rate-limit');

// 1. Auth Limiter: For login and signup to prevent brute-forcing
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per window
    message: {
        status: 'fail',
        message: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
    },
    standardHeaders: true, // Return rate limit info in standard headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
});

// 2. OTP Limiter: For sending OTP codes to prevent email/connection spamming
const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3, // Limit each IP to 3 requests per window
    message: {
        status: 'fail',
        message: 'Too many verification code requests from this IP. Please try again after 10 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// 3. Report Limiter: For submitting reports to prevent spam
const reportLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 requests per window
    message: {
        status: 'fail',
        message: 'Too many reports submitted from this IP. Please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// 4. AI Generation Limiter: For AI generation/lookup requests to manage API quota/costs
const aiGenerationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 6, // Limit each IP to 6 requests per window
    message: {
        status: 'fail',
        message: 'Too many AI generation requests from this IP. Please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    authLimiter,
    otpLimiter,
    reportLimiter,
    aiGenerationLimiter
};
