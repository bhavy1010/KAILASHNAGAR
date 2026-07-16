const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
    saveResult,
    getClassResults,
    getStudentResult,
    getAllResultsForStudent,
    getMarksEntryData,
    getResultAnalytics
} = require("../controllers/result.controller");

// Specific routes before dynamic params
router.get("/analytics", authMiddleware, roleMiddleware("admin", "teacher"), getResultAnalytics);
router.get("/entry/:examId", authMiddleware, roleMiddleware("admin", "teacher"), getMarksEntryData);
router.get("/class/:examId", authMiddleware, getClassResults);
router.get("/student/:studentId/exam/:examId", authMiddleware, getStudentResult);
router.get("/student/:studentId", authMiddleware, getAllResultsForStudent);
router.post("/save", authMiddleware, roleMiddleware("admin", "teacher"), saveResult);

module.exports = router;