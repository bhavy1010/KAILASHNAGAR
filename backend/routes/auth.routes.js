const express = require("express");

const router = express.Router();

const {
    registerAdmin,
    loginUser,
    resetAdminPassword
} = require("../controllers/auth.controller");

// Create a new Admin account
// Requires the secret code
router.post(
    "/register-admin",
    registerAdmin
);

// Login for Admin, Teacher and Student
router.post(
    "/login",
    loginUser
);

// Admin forgot-password reset
// Requires mobile number + secret code
router.post(
    "/reset-admin-password",
    resetAdminPassword
);

module.exports = router;