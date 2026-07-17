const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

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

module.exports = {
    registerAdmin,
    loginUser,
    resetAdminPassword
};