const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const {
    addVideo,
    getVideos,
    deleteVideo
} = require("../controllers/videoLibrary.controller");

// All authenticated users (Admin, Teacher, Student) can fetch video library
router.get("/all", authMiddleware, getVideos);

// Only Admins and Teachers can add educational YouTube videos
router.post("/add", authMiddleware, roleMiddleware("admin", "teacher"), addVideo);

// Only Admins or video uploader teacher can delete a video
router.delete("/:id", authMiddleware, roleMiddleware("admin", "teacher"), deleteVideo);

module.exports = router;
