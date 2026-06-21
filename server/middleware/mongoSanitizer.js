/**
 * Custom MongoDB Query & Body Sanitizer
 * Compatible with Express 5 (handles read-only req.query getters by mutating properties in-place).
 * Recursively removes keys starting with '$' or containing '.' to prevent NoSQL injection.
 */
const sanitizeObject = (obj) => {
    if (obj && typeof obj === 'object') {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (key.startsWith('$') || key.includes('.')) {
                    delete obj[key];
                } else if (typeof obj[key] === 'object') {
                    sanitizeObject(obj[key]);
                }
            }
        }
    }
};

const mongoSanitize = (req, res, next) => {
    if (req.body) sanitizeObject(req.body);
    if (req.params) sanitizeObject(req.params);
    if (req.query) sanitizeObject(req.query); // Mutates in-place to avoid Express 5 read-only TypeError
    next();
};

module.exports = mongoSanitize;
