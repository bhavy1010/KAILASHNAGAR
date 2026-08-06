const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");

const {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} = require("../controllers/notification.controller");

// Every route here is scoped to the logged-in user inside the
// controller itself (filters by req.user.id + req.user.role),
// so no roleMiddleware is needed — any authenticated user can
// only ever see/touch their own notifications.

router.get("/my", authMiddleware, getMyNotifications);

router.get("/unread-count", authMiddleware, getUnreadCount);

router.put("/:id/read", authMiddleware, markAsRead);

router.put("/read-all", authMiddleware, markAllAsRead);

module.exports = router;