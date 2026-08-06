const express = require("express");

const router = express.Router();

const {
    registerAdmin,
    loginUser,
    resetAdminPassword,
    resetTeacherPassword,
    logoutUser,
    getMe
} = require("../controllers/auth.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");

const {
    loginLimiter,
    registerAdminLimiter,
    resetPasswordLimiter,
    teacherResetPasswordLimiter
} = require("../middlewares/rateLimit.middleware");

const {
    registerAdminSchema,
    loginSchema,
    resetAdminPasswordSchema,
    resetTeacherPasswordSchema
} = require("../validators/auth.validator");

// Create a new Admin account
// Requires the secret code
router.post(
    "/register-admin",
    registerAdminLimiter,
    validate(registerAdminSchema),
    registerAdmin
);

// Login for Admin, Teacher and Student
router.post(
    "/login",
    loginLimiter,
    validate(loginSchema),
    loginUser
);

// Admin forgot-password reset
// Requires mobile number + secret code
router.post(
    "/reset-admin-password",
    resetPasswordLimiter,
    validate(resetAdminPasswordSchema),
    resetAdminPassword
);

// Teacher forgot-password reset
// Requires mobile number + a SEPARATE 6-digit secret code
// (TEACHER_RESET_CODE, distinct from the admin's code)
router.post(
    "/reset-teacher-password",
    teacherResetPasswordLimiter,
    validate(resetTeacherPasswordSchema),
    resetTeacherPassword
);

// Logout: clears the auth cookie
router.post(
    "/logout",
    logoutUser
);

// Returns the logged-in user based on the auth cookie
// Used by the frontend to silently restore a session on refresh
router.get(
    "/me",
    authMiddleware,
    getMe
);

module.exports = router;