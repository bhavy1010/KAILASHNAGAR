const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const { generateRefreshToken, rotateRefreshToken, revokeRefreshToken, revokeAllUserTokens } = require("../services/refreshToken.service");
const { generateCsrfToken, setCsrfCookie, getAuthCookieOptions, getCsrfCookieOptions } = require("../middlewares/auth.middleware");
const { canUploadStudentPhoto, canUploadTeacherPhoto } = require("../services/authorization.service");

// ======================================================
// Cookie options for the auth token
// ======================================================

const AUTH_COOKIE_NAME = "token";

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

        const token = admin.generateAuthToken();
        const refreshToken = await generateRefreshToken(admin._id, "User", "admin");
        const csrfToken = generateCsrfToken();

        res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
        setCsrfCookie(res, csrfToken);

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
        console.error("Register admin error:", error);

        res.status(500).json({
            success: false,
            message: process.env.NODE_ENV === "production"
                ? "Internal server error."
                : error.message
        });
    }
};

// ======================================================
// Login: Admin / Teacher / Student
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

        const normalizedRole = (role || "").toLowerCase();

        if (normalizedRole === "student") {
            account = await Student.findOne({
                grNumber: identifier.trim(),
                status: { $ne: "Inactive" }
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
                photo: account.photo || "",
                mustResetPassword: account.mustResetPassword || false
            };
        }

        if (normalizedRole === "teacher") {
            account = await Teacher.findOne({
                mobile: identifier.trim(),
                status: { $ne: "Inactive" }
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
                photo: account.photo || "",
                mustResetPassword: account.mustResetPassword || false
            };
        }

        if (normalizedRole === "admin") {
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
                role: "admin",
                photo: account.photo || "",
                mustResetPassword: account.mustResetPassword || false
            };
        }

        if (!account || !user) {
            return res.status(400).json({
                success: false,
                message: "Invalid login role"
            });
        }

        const token = account.generateAuthToken();
        const refreshToken = await generateRefreshToken(
            account._id,
            normalizedRole === "student" ? "Student" : normalizedRole === "teacher" ? "Teacher" : "User",
            normalizedRole
        );
        const csrfToken = generateCsrfToken();

        res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
        setCsrfCookie(res, csrfToken);

        res.status(200).json({
            success: true,
            message: "Login successful",
            user,
            csrfToken
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: process.env.NODE_ENV === "production"
                ? "Internal server error."
                : error.message
        });
    }
};

// ======================================================
// Admin Forgot Password
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

        if (!process.env.ADMIN_SIGNUP_CODE) {
            return res.status(500).json({
                success: false,
                message: "Admin secret code is not configured on the server"
            });
        }

        if (secretCode !== process.env.ADMIN_SIGNUP_CODE) {
            return res.status(403).json({
                success: false,
                message: "Invalid admin secret code"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters"
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
        admin.mustResetPassword = false;
        await admin.save();

        res.status(200).json({
            success: true,
            message: "Admin password reset successfully"
        });

    } catch (error) {
        console.error("Reset admin password error:", error);

        res.status(500).json({
            success: false,
            message: process.env.NODE_ENV === "production"
                ? "Internal server error."
                : error.message
        });
    }
};

// ======================================================
// Teacher Forgot Password
// Requires mobile number + TEACHER_RESET_CODE
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

        if (!process.env.TEACHER_RESET_CODE) {
            return res.status(500).json({
                success: false,
                message: "Teacher reset code is not configured on the server"
            });
        }

        if (secretCode !== process.env.TEACHER_RESET_CODE) {
            return res.status(403).json({
                success: false,
                message: "Invalid teacher reset code"
            });
        }

        if (secretCode === process.env.ADMIN_SIGNUP_CODE) {
            return res.status(403).json({
                success: false,
                message: "Invalid teacher reset code"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters"
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
        teacher.mustResetPassword = false;
        await teacher.save();

        res.status(200).json({
            success: true,
            message: "Teacher password reset successfully"
        });

    } catch (error) {
        console.error("Reset teacher password error:", error);

        res.status(500).json({
            success: false,
            message: process.env.NODE_ENV === "production"
                ? "Internal server error."
                : error.message
        });
    }
};

// ======================================================
// Change Password (authenticated user)
// ======================================================

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "New password must contain at least 8 characters"
            });
        }

        const { id, role } = req.user;
        const normalizedRole = (role || "").toLowerCase();

        let account = null;
        let UserModel;

        if (normalizedRole === "student") {
            UserModel = Student;
        } else if (normalizedRole === "teacher") {
            UserModel = Teacher;
        } else {
            UserModel = User;
        }

        account = await UserModel.findById(id);

        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            });
        }

        const isMatch = await account.comparePassword(currentPassword);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        account.password = newPassword;
        account.mustResetPassword = false;
        await account.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {
        console.error("Change password error:", error);

        res.status(500).json({
            success: false,
            message: process.env.NODE_ENV === "production"
                ? "Internal server error."
                : error.message
        });
    }
};

// ======================================================
// Logout
// ======================================================

const logoutUser = async (req, res) => {
    try {
        const token = req.cookies?.token;

        if (token) {
            const decoded = jwt.decode(token);
            const userId = decoded?.id;
            const userRole = decoded?.role;

            if (userId && userRole) {
                const userModel = userRole === "student"
                    ? "Student"
                    : userRole === "teacher"
                        ? "Teacher"
                        : "User";

                await revokeAllUserTokens(userId, userModel);
            }
        }

        res.clearCookie(AUTH_COOKIE_NAME);
        res.clearCookie("XSRF-TOKEN");

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: process.env.NODE_ENV === "production"
                ? "Internal server error."
                : error.message
        });
    }
};

// ======================================================
// Get Current Logged-In User
// ======================================================

const getMe = async (req, res) => {
    try {
        const { id, role } = req.user;
        const normalizedRole = (role || "").toLowerCase();

        let account = null;
        let user = null;

        if (normalizedRole === "student") {
            account = await Student.findById(id);

            if (account && account.status !== "Inactive") {
                user = {
                    id: account._id,
                    name: account.fullName,
                    grNumber: account.grNumber,
                    role: "student",
                    photo: account.photo || "",
                    mustResetPassword: account.mustResetPassword || false
                };
            }
        }

        if (normalizedRole === "teacher") {
            account = await Teacher.findById(id);

            if (account && account.status !== "Inactive") {
                user = {
                    id: account._id,
                    name: account.fullName,
                    mobile: account.mobile,
                    role: "teacher",
                    photo: account.photo || "",
                    mustResetPassword: account.mustResetPassword || false
                };
            }
        }

        if (normalizedRole === "admin") {
            account = await User.findById(id);

            if (account) {
                user = {
                    id: account._id,
                    name: account.name,
                    mobile: account.mobile,
                    role: "admin",
                    photo: account.photo || "",
                    mustResetPassword: account.mustResetPassword || false
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
        console.error("Get me error:", error);

        res.status(500).json({
            success: false,
            message: process.env.NODE_ENV === "production"
                ? "Internal server error."
                : error.message
        });
    }
};

// ======================================================
// Refresh Access Token with rotation
// ======================================================

const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Refresh token is required"
            });
        }

        const { user, userModel } = await validateRefreshToken(token);

        let UserModel;
        switch (userModel) {
            case "User":
                UserModel = require("../models/User");
                break;
            case "Teacher":
                UserModel = require("../models/Teacher");
                break;
            case "Student":
                UserModel = require("../models/Student");
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid user model"
                });
        }

        const newAccessToken = user.generateAuthToken();
        const newRefreshToken = await rotateRefreshToken(
            token,
            user._id,
            userModel,
            userModel === "User" ? "admin" : userModel === "Teacher" ? "teacher" : "student"
        );

        res.status(200).json({
            success: true,
            token: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: process.env.NODE_ENV === "production"
                ? "Invalid refresh token"
                : (error.message || "Invalid refresh token")
        });
    }
};

module.exports = {
    registerAdmin,
    loginUser,
    resetAdminPassword,
    resetTeacherPassword,
    changePassword,
    logoutUser,
    getMe,
    refreshToken
};
