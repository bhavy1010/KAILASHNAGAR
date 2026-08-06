const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

// ======================================================
// Cookie options for the auth token
// Stays valid until the user logs out (30 days),
// httpOnly so client-side JS/XSS can't read the token.
// ======================================================

const AUTH_COOKIE_NAME = "token";

const AUTH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

const getAuthCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: AUTH_COOKIE_MAX_AGE
});

// ======================================================
// Create Admin Account
// Secret code comes from backend .env file
// ======================================================

const registerAdmin = async (req, res) => {
    try {
        const {
            name,
            mobile,
            password,
            secretCode
        } = req.body;

        if (!name || !mobile || !password || !secretCode) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (!process.env.ADMIN_SIGNUP_CODE) {
            return res.status(500).json({
                success: false,
                message: "Admin signup code is not configured"
            });
        }

        if (secretCode !== process.env.ADMIN_SIGNUP_CODE) {
            return res.status(403).json({
                success: false,
                message: "Invalid admin secret code"
            });
        }

        const existingUser = await User.findOne({ mobile });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "An account already exists with this mobile number"
            });
        }

        const admin = await User.create({
            name,
            mobile,
            password,
            role: "admin"
        });

        res.status(201).json({
            success: true,
            message: "Admin account created successfully",
            user: {
                id: admin._id,
                name: admin.name,
                mobile: admin.mobile,
                role: admin.role
            }
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// Login: Admin / Teacher / Student
// Admin   -> Mobile Number + Password
// Teacher -> Mobile Number + Password
// Student -> GR Number + DOB Password
// ======================================================

const loginUser = async (req, res) => {
    try {
        const {
            identifier,
            password,
            role
        } = req.body;

        if (!identifier || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Role, ID and password are required"
            });
        }

        let account = null;
        let user = null;

        if (role === "student") {
            account = await Student.findOne({
                grNumber: identifier.trim(),
                status: "Active"
            });

            if (!account) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid GR Number or student account is inactive"
                });
            }

            const isMatch = await account.comparePassword(password);

            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid password"
                });
            }

            user = {
                id: account._id,
                name: account.fullName,
                grNumber: account.grNumber,
                role: "student",
                photo: account.photo || ""
            };
        }

        if (role === "teacher") {
            account = await Teacher.findOne({
                mobile: identifier.trim(),
                status: "Active"
            });

            if (!account) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid mobile number or teacher account is inactive"
                });
            }

            const isMatch = await account.comparePassword(password);

            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid password"
                });
            }

            user = {
                id: account._id,
                name: account.fullName,
                mobile: account.mobile,
                role: "teacher",
                photo: account.photo || ""
            };
        }

        if (role === "admin") {
            account = await User.findOne({
                mobile: identifier.trim(),
                role: "admin"
            });

            if (!account) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid admin mobile number"
                });
            }

            const isMatch = await account.comparePassword(password);

            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid password"
                });
            }

            user = {
                id: account._id,
                name: account.name,
                mobile: account.mobile,
                role: "admin"
            };
        }

        if (!account) {
            return res.status(400).json({
                success: false,
                message: "Invalid login role"
            });
        }

        const token = account.generateAuthToken();

        res.cookie(
            AUTH_COOKIE_NAME,
            token,
            getAuthCookieOptions()
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// Admin Forgot Password
// Admin must enter mobile number + secret code
// ======================================================

const resetAdminPassword = async (req, res) => {
    try {
        const {
            mobile,
            secretCode,
            newPassword
        } = req.body;

        if (!mobile || !secretCode || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Mobile number, secret code and new password are required"
            });
        }

        if (secretCode !== process.env.ADMIN_SIGNUP_CODE) {
            return res.status(403).json({
                success: false,
                message: "Invalid admin secret code"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters"
            });
        }

        const admin = await User.findOne({
            mobile: mobile.trim(),
            role: "admin"
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin account not found"
            });
        }

        admin.password = newPassword;
        await admin.save();

        res.status(200).json({
            success: true,
            message: "Admin password updated successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// Teacher Forgot Password
// Teacher must enter mobile number + secret code
//
// Uses TEACHER_RESET_CODE, a SEPARATE secret from the
// admin's ADMIN_SIGNUP_CODE (see .env.example). Keeping
// them distinct means a teacher who learns this code can
// only ever reset teacher passwords, never register or
// reset an admin account.
// ======================================================

const resetTeacherPassword = async (req, res) => {
    try {
        const {
            mobile,
            secretCode,
            newPassword
        } = req.body;

        if (!mobile || !secretCode || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Mobile number, secret code and new password are required"
            });
        }

        // Misconfiguration guard: if the school hasn't set a
        // TEACHER_RESET_CODE yet, fail clearly instead of every
        // attempt silently failing with "Invalid secret code".
        if (!process.env.TEACHER_RESET_CODE) {
            return res.status(500).json({
                success: false,
                message: "Teacher password reset is not configured yet. Please contact the admin."
            });
        }

        if (secretCode !== process.env.TEACHER_RESET_CODE) {
            return res.status(403).json({
                success: false,
                message: "Invalid teacher secret code"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 6 characters"
            });
        }

        const teacher = await Teacher.findOne({
            mobile: mobile.trim()
        });

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher account not found"
            });
        }

        teacher.password = newPassword;
        await teacher.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// Logout
// Clears the auth cookie so the session actually ends
// ======================================================

const logoutUser = async (req, res) => {
    try {
        res.clearCookie(
            AUTH_COOKIE_NAME,
            getAuthCookieOptions()
        );

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// Get Current Logged-In User
// Used by the frontend on page load/refresh to silently
// restore the session from the httpOnly cookie, so the
// user is never bounced back to the login page while the
// cookie is still valid.
// ======================================================

const getMe = async (req, res) => {
    try {
        const { id, role } = req.user;

        let account = null;
        let user = null;

        if (role === "student") {
            account = await Student.findOne({ _id: id, status: "Active" });

            if (account) {
                user = {
                    id: account._id,
                    name: account.fullName,
                    grNumber: account.grNumber,
                    role: "student",
                    photo: account.photo || ""
                };
            }
        }

        if (role === "teacher") {
            account = await Teacher.findOne({ _id: id, status: "Active" });

            if (account) {
                user = {
                    id: account._id,
                    name: account.fullName,
                    mobile: account.mobile,
                    role: "teacher",
                    photo: account.photo || ""
                };
            }
        }

        if (role === "admin") {
            account = await User.findOne({ _id: id, role: "admin" });

            if (account) {
                user = {
                    id: account._id,
                    name: account.name,
                    mobile: account.mobile,
                    role: "admin"
                };
            }
        }

        if (!account || !user) {
            return res.status(401).json({
                success: false,
                message: "Session no longer valid"
            });
        }

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    registerAdmin,
    loginUser,
    resetAdminPassword,
    resetTeacherPassword,
    logoutUser,
    getMe
};