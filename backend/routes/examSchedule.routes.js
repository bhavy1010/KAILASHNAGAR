const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
    addSchedule,
    getScheduleByExam,
    updateSchedule,
    deleteSchedule
} = require("../controllers/examSchedule.controller");

router.post("/add", authMiddleware, roleMiddleware("admin", "teacher"), addSchedule);
router.get("/exam/:examId", authMiddleware, getScheduleByExam);
router.put("/:id", authMiddleware, roleMiddleware("admin", "teacher"), updateSchedule);
router.delete("/:id", authMiddleware, roleMiddleware("admin", "teacher"), deleteSchedule);

module.exports = router;