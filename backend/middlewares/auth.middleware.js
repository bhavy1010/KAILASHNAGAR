const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ======================================================
// Authentication Middleware
// ======================================================

const AUTH_COOKIE_NAME = "token";
const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "x-xsrf-token";

const generateCsrfToken = () => crypto.randomBytes(32).toString("hex");

const setCsrfCookie = (res, token) => {
    res.cookie(CSRF_COOKIE_NAME, token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: AUTH_COOKIE_MAX_AGE
    });
};

const verifyCsrfToken = (req) => {
    const headerToken = req.headers[CSRF_HEADER_NAME];
    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];

    if (!headerToken || !cookieToken) {
        return false;
    }

    return headerToken === cookieToken;
};

const authMiddleware = (req, res, next) => {

    try {

        const fromCookie = Boolean(req.cookies?.token);

        let token = req.cookies?.token;

        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            }
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authorization token missing"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        if (fromCookie) {
            res.cookie(AUTH_COOKIE_NAME, token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: AUTH_COOKIE_MAX_AGE
            });
        }

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or Expired Token"
        });
    }
};

// ======================================================
// CSRF Protection Middleware
// Bypasses safe methods; validates state-changing
// requests against the double-submit cookie.
// ======================================================

const csrfMiddleware = (req, res, next) => {
    const method = req.method.toLowerCase();
    if (["get", "head", "options"].includes(method)) {
        return next();
    }

    const isAuthRoute = req.path.startsWith("/api/auth");
    if (isAuthRoute) {
        return next();
    }

    if (!verifyCsrfToken(req)) {
        return res.status(403).json({
            success: false,
            message: "Invalid CSRF token"
        });
    }

    next();
};

const getAuthCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: AUTH_COOKIE_MAX_AGE
});

const getCsrfCookieOptions = () => ({
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: AUTH_COOKIE_MAX_AGE
});

module.exports = authMiddleware;
module.exports.csrfMiddleware = csrfMiddleware;
module.exports.generateCsrfToken = generateCsrfToken;
module.exports.setCsrfCookie = setCsrfCookie;
module.exports.verifyCsrfToken = verifyCsrfToken;
module.exports.getAuthCookieOptions = getAuthCookieOptions;
module.exports.getCsrfCookieOptions = getCsrfCookieOptions;