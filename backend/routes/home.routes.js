const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const { uploadHome } = require("../middlewares/upload.middleware");

const {
    getPublicHomeData,
    getSchoolInfo,
    updateSchoolInfo,
    createAchievement,
    getAllAchievements,
    updateAchievement,
    deleteAchievement,
    saveTodayRose,
    getAllTodayRoses,
    deleteTodayRose
} = require("../controllers/home.controller");

// ======================================================
// Public Home Page
// ======================================================

router.get(
    "/public",
    getPublicHomeData
);

router.get(
    "/school-info",
    getSchoolInfo
);

// ======================================================
// School Information
// Admin only
// ======================================================

router.put(
    "/school-info",
    authMiddleware,
    roleMiddleware("admin"),
    updateSchoolInfo
);

// ======================================================
// Achievement Management
// Admin only
// ======================================================

router.get(
    "/achievements",
    authMiddleware,
    roleMiddleware("admin"),
    getAllAchievements
);

router.post(
    "/achievements",
    authMiddleware,
    roleMiddleware("admin"),
    uploadHome.single("photo"),
    createAchievement
);

router.put(
    "/achievements/:id",
    authMiddleware,
    roleMiddleware("admin"),
    uploadHome.single("photo"),
    updateAchievement
);

router.delete(
    "/achievements/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteAchievement
);

// ======================================================
// Today's Rose Management
// Admin only
// ======================================================

router.get(
    "/today-roses",
    authMiddleware,
    roleMiddleware("admin"),
    getAllTodayRoses
);

router.post(
    "/today-roses",
    authMiddleware,
    roleMiddleware("admin"),
    uploadHome.single("photo"),
    saveTodayRose
);

router.delete(
    "/today-roses/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteTodayRose
);

module.exports = router;