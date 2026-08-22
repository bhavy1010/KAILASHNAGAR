const express = require("express");

const router = express.Router();

const {
    registerAdmin,
    loginUser,
    resetAdminPassword,
    resetTeacherPassword,
    changePassword,
    logoutUser,
    getMe,
    refreshToken
} = require("../controllers/auth.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const { csrfMiddleware } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");

const {
    registerAdminLimiter,
    loginLimiter,
    resetPasswordLimiter,
    teacherResetPasswordLimiter
} = require("../middlewares/rateLimit.middleware");

const {
    registerAdminSchema,
    loginSchema,
    resetAdminPasswordSchema,
    resetTeacherPasswordSchema,
    changePasswordSchema
} = require("../validators/auth.validator");

router.post(
    "/register-admin",
    registerAdminLimiter,
    validate(registerAdminSchema),
    registerAdmin
);

router.post(
    "/login",
    loginLimiter,
    validate(loginSchema),
    loginUser
);

router.post(
    "/reset-admin-password",
    resetPasswordLimiter,
    validate(resetAdminPasswordSchema),
    resetAdminPassword
);

router.post(
    "/reset-teacher-password",
    teacherResetPasswordLimiter,
    validate(resetTeacherPasswordSchema),
    resetTeacherPassword
);

router.post(
    "/change-password",
    authMiddleware,
    csrfMiddleware,
    validate(changePasswordSchema),
    changePassword
);

router.post(
    "/logout",
    authMiddleware,
    csrfMiddleware,
    logoutUser
);

router.post(
    "/refresh-token",
    refreshToken
);

router.get(
    "/me",
    authMiddleware,
    getMe
);

module.exports = router;
