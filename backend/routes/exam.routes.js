const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");

const {
    createExam,
    getAllExams,
    getExamById,
    updateExam,
    deleteExam,
    getExamDashboard
} = require("../controllers/exam.controller");

const {
    createExamSchema,
    updateExamSchema
} = require("../validators/exam.validator");

// Specific routes before dynamic :id
router.get("/dashboard", authMiddleware, roleMiddleware("admin", "teacher"), getExamDashboard);
router.get("/all", authMiddleware, getAllExams);
router.post("/add", authMiddleware, roleMiddleware("admin", "teacher"), validate(createExamSchema), createExam);
router.get("/:id", authMiddleware, getExamById);
router.put("/:id", authMiddleware, roleMiddleware("admin", "teacher"), validate(updateExamSchema), updateExam);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteExam);

module.exports = router;