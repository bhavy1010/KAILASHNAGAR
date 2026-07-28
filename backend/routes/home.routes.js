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
    getAchievements,
    deleteAchievement,
    createTodayRose,
    getTodayRoses,
    deleteTodayRose,
    getGalleryPhotos,
    addGalleryPhoto,
    deleteGalleryPhoto
} = require("../controllers/home.controller");

// Public home page routes
router.get("/public", getPublicHomeData);
router.get("/school-info", getSchoolInfo);

// School information management
router.put(
    "/school-info",
    authMiddleware,
    roleMiddleware("admin"),
    uploadHome.single("logo"),
    updateSchoolInfo
);

// Achievement management
router.get(
    "/achievements",
    authMiddleware,
    roleMiddleware("admin"),
    getAchievements
);

router.post(
    "/achievements",
    authMiddleware,
    roleMiddleware("admin"),
    uploadHome.single("photo"),
    createAchievement
);

router.delete(
    "/achievements/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteAchievement
);

// Today's Rose management
router.get(
    "/today-roses",
    authMiddleware,
    roleMiddleware("admin"),
    getTodayRoses
);

router.post(
    "/today-roses",
    authMiddleware,
    roleMiddleware("admin"),
    uploadHome.single("photo"),
    createTodayRose
);

router.delete(
    "/today-roses/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteTodayRose
);

// Home page photo gallery management
router.get(
    "/gallery",
    authMiddleware,
    roleMiddleware("admin"),
    getGalleryPhotos
);

router.post(
    "/gallery",
    authMiddleware,
    roleMiddleware("admin"),
    uploadHome.single("photo"),
    addGalleryPhoto
);

router.delete(
    "/gallery/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteGalleryPhoto
);

module.exports = router;