const rateLimit = require("express-rate-limit");

// ======================================================
// Rate Limiting Middleware
//
// Protects sensitive auth endpoints from brute-force /
// credential-stuffing attacks by capping how many requests
// a single IP can make in a given time window.
// ======================================================

// Shared JSON shape for every 429 response so the frontend
// can handle rate limiting the same way it handles any other
// API error (error.response.data.message).

const buildLimiter = ({ windowMs, max, message }) =>
    rateLimit({
        windowMs,
        max,
        standardHeaders: true, // adds RateLimit-* response headers
        legacyHeaders: false, // disables the older X-RateLimit-* headers
        handler: (req, res) => {
            res.status(429).json({
                success: false,
                message
            });
        }
    });

// Login: 10 attempts per 15 minutes per IP.
// Generous enough for a genuine user who mistypes a password
// a few times, tight enough to stop automated brute-forcing.

const loginLimiter = buildLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message:
        "Too many login attempts. Please try again after 15 minutes."
});

// Admin registration: 5 attempts per hour per IP.
// This endpoint is guarded by ADMIN_SIGNUP_CODE, so it is a
// prime target for anyone trying to brute-force that code.

const registerAdminLimiter = buildLimiter({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message:
        "Too many admin registration attempts. Please try again after an hour."
});

// Admin password reset: also guarded by a secret code, same
// reasoning as above.

const resetPasswordLimiter = buildLimiter({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message:
        "Too many password reset attempts. Please try again after an hour."
});

// Teacher password reset: also guarded by a secret code, same
// reasoning as above. Kept as its own bucket (separate from
// resetPasswordLimiter) so a burst of teacher reset attempts
// can never starve out an admin's own reset attempts, or vice
// versa.

const teacherResetPasswordLimiter = buildLimiter({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message:
        "Too many password reset attempts. Please try again after an hour."
});

const globalLimiter = buildLimiter({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message:
        "Too many requests. Please try again after 15 minutes."
});

module.exports = {
    loginLimiter,
    registerAdminLimiter,
    resetPasswordLimiter,
    teacherResetPasswordLimiter,
    globalLimiter
};