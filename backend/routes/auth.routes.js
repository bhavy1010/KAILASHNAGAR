const express = require("express");

const router = express.Router();

const {

    registerUser,

    loginUser

} = require("../controllers/auth.controller");

// ======================================================
// Admin Registration
// Only used for first admin or protected admin creation
// ======================================================

router.post(
    "/register",
    registerUser
);

// ======================================================
// Login
// Admin  -> Mobile + Password
// Teacher -> Mobile + Password
// Student -> GR Number + Password
// ======================================================

router.post(
    "/login",
    loginUser
);

module.exports = router;