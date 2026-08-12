// ======================================================
// Role Authorization Middleware
// ======================================================

const roleMiddleware = (...roles) => {

    return (req, res, next) => {

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message: "Unauthorized"

            });

        }

        const userRole = (req.user.role || "").toLowerCase();
        const allowedRoles = roles.map(r => r.toLowerCase());

        if (!allowedRoles.includes(userRole)) {

            return res.status(403).json({

                success: false,

                message: "Access Denied"

            });

        }

        next();

    };

};

module.exports = roleMiddleware;