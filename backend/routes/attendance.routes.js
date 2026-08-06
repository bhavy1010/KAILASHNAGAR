const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");

const {
    markClassAttendanceSchema
} = require("../validators/attendance.validator");

const {
    markClassAttendance,
    getClassAttendance,
    getDashboardStats,
    getTodayAttendance,
    getAttendanceHistory,
    getStudentAttendanceReport,
    getClassAttendanceReport,
    getCalendarAttendance,
    getAttendanceAnalytics,
    exportAttendanceExcel
} = require("../controllers/attendance.controller");

router.post(

    "/class",

    authMiddleware,

    roleMiddleware("admin", "teacher"),

    validate(markClassAttendanceSchema),

    markClassAttendance

);

router.get(

    "/class",

    authMiddleware,

    roleMiddleware("admin", "teacher"),

    getClassAttendance

);

router.get(

    "/dashboard",

    authMiddleware,

    getDashboardStats

);

router.get(

    "/today",

    authMiddleware,

    getTodayAttendance

);

router.get(

    "/history",

    authMiddleware,

    getAttendanceHistory

);

router.get(

    "/class-report",

    authMiddleware,

    getClassAttendanceReport

);

router.get(

    "/calendar",

    authMiddleware,

    getCalendarAttendance

);

router.get(

    "/analytics",

    authMiddleware,

    roleMiddleware("admin", "teacher"),

    getAttendanceAnalytics

);

router.get(

    "/student/:studentId",

    authMiddleware,

    getStudentAttendanceReport

);

// Download attendance report as Excel
// Admin and Teacher only
router.get(
    "/export/excel",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    exportAttendanceExcel
);

module.exports = router;