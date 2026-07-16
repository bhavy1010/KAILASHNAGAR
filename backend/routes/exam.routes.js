const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
    createExam,
    getAllExams,
    getExamById,
    updateExam,
    deleteExam,
    getExamDashboard
} = require("../controllers/exam.controller");

// Specific routes before dynamic :id
router.get("/dashboard", authMiddleware, roleMiddleware("admin", "teacher"), getExamDashboard);
router.get("/all", authMiddleware, getAllExams);
router.post("/add", authMiddleware, roleMiddleware("admin", "teacher"), createExam);
router.get("/:id", authMiddleware, getExamById);
router.put("/:id", authMiddleware, roleMiddleware("admin", "teacher"), updateExam);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteExam);

module.exports = router;