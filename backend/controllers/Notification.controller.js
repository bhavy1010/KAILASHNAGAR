const Notification = require("../models/Notification");

// ======================================================
// Get My Notifications
// GET /api/notifications/my?limit=20
// Always scoped to the logged-in user — nobody can read
// anyone else's notifications by guessing an ID.
// ======================================================

const getMyNotifications = async (req, res) => {

    try {

        const limit = Math.min(Number(req.query.limit) || 20, 100);

        const notifications = await Notification.find({
            userId: req.user.id,
            userRole: req.user.role
        })
            .sort({ createdAt: -1 })
            .limit(limit);

        const unreadCount = await Notification.countDocuments({
            userId: req.user.id,
            userRole: req.user.role,
            read: false
        });

        res.status(200).json({

            success: true,
            count: notifications.length,
            unreadCount,
            notifications

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// Get Unread Count Only
// GET /api/notifications/unread-count
// Lightweight endpoint for polling — no need to pull the
// full list just to update a badge number.
// ======================================================

const getUnreadCount = async (req, res) => {

    try {

        const unreadCount = await Notification.countDocuments({
            userId: req.user.id,
            userRole: req.user.role,
            read: false
        });

        res.status(200).json({
            success: true,
            unreadCount
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// Mark One Notification As Read
// PUT /api/notifications/:id/read
// ======================================================

const markAsRead = async (req, res) => {

    try {

        const notification = await Notification.findOneAndUpdate(

            {
                _id: req.params.id,
                userId: req.user.id,
                userRole: req.user.role
            },

            { read: true },

            { new: true }

        );

        if (!notification) {

            return res.status(404).json({
                success: false,
                message: "Notification Not Found"
            });

        }

        res.status(200).json({
            success: true,
            notification
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// Mark All As Read
// PUT /api/notifications/read-all
// ======================================================

const markAllAsRead = async (req, res) => {

    try {

        await Notification.updateMany(

            {
                userId: req.user.id,
                userRole: req.user.role,
                read: false
            },

            { read: true }

        );

        res.status(200).json({
            success: true,
            message: "All Notifications Marked As Read"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
};