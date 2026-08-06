const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const { createTimetable, getClassTimetable, updateTimetable, deleteTimetable } = require("../controllers/timetable.controller");

router.post("/add", authMiddleware, roleMiddleware("admin", "teacher"), createTimetable);
router.get("/class/:classId", authMiddleware, getClassTimetable);
router.put("/:id", authMiddleware, roleMiddleware("admin", "teacher"), updateTimetable);
router.delete("/:id", authMiddleware, roleMiddleware("admin", "teacher"), deleteTimetable);

module.exports = router;
