const jwt = require("jsonwebtoken");

// ======================================================
// Authentication Middleware
// ======================================================

const AUTH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

const authMiddleware = (req, res, next) => {

    try {

        // Prefer the httpOnly cookie set on login. Fall back to the
        // Authorization header so any non-browser / API clients still work.
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

        // Sliding session: as long as the user keeps using the site
        // within the cookie's window, push the expiry forward so they
        // are never forced to log in again until they explicitly log out.
        if (fromCookie) {

            res.cookie("token", token, {
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

module.exports = authMiddleware;