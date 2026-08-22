const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
    getStudentRisk,
    getClassRisk,
    getRiskDashboard
} = require("../controllers/studentRisk.controller");

// ======================================================
// Individual student risk assessment
// GET /api/student-risk/:studentId
// ======================================================

router.get(
    "/:studentId",
    authMiddleware,
    roleMiddleware("admin", "teacher", "student"),
    getStudentRisk
);

// ======================================================
// Class risk dashboard
// GET /api/student-risk/class/:standard/:division
// ======================================================

router.get(
    "/class/:standard/:division",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    getClassRisk
);

// ======================================================
// Overall risk dashboard
// GET /api/student-risk/dashboard
// ======================================================

router.get(
    "/dashboard",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    getRiskDashboard
);

module.exports = router;
