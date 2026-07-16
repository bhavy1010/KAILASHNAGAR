const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const { uploadNotice } = require("../middlewares/upload.middleware");

const {
    createNotice,
    getAllNotices,
    getNoticeById,
    updateNotice,
    deleteNotice,
    searchNotices,
    getNoticesByAudience,
    archiveNotice,
    getArchivedNotices,
    getNoticeDashboard
} = require("../controllers/notice.controller");

// Specific routes before dynamic :id
router.get("/dashboard", authMiddleware, roleMiddleware("admin"), getNoticeDashboard);
router.get("/all", authMiddleware, getAllNotices);
router.get("/search", authMiddleware, searchNotices);
router.get("/archived", authMiddleware, roleMiddleware("admin"), getArchivedNotices);
router.get("/audience/:role", authMiddleware, getNoticesByAudience);

router.post(
    "/add",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    uploadNotice.single("attachment"),
    createNotice
);

router.get("/:id", authMiddleware, getNoticeById);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    uploadNotice.single("attachment"),
    updateNotice
);

router.put(
    "/:id/archive",
    authMiddleware,
    roleMiddleware("admin"),
    archiveNotice
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteNotice
);

module.exports = router;