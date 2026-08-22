const { isAdmin } = require("../services/authorization.service");
const Notice = require("../models/Notice");
const { notifyAudience } = require("../services/notification.service");
const { isClassTeacherOfAnyClass } = require("../services/classTeacher.service");

// ======================================================
// Create Notice
// POST /api/notices/add
// ======================================================

const createNotice = async (req, res) => {

    try {

        // Only admins, or a teacher who is the assigned Class Teacher
        // for at least one class, can post notices. Regular subject
        // teachers who aren't a class teacher for any class can't.
        if (!isAdmin(req.user) && req.user.role === "teacher") {

            const authorized = await isClassTeacherOfAnyClass(req.user.id);

            if (!authorized) {

                return res.status(403).json({
                    success: false,
                    message: "Only Class Teachers can post notices. Please contact the Admin if you need one posted."
                });

            }

        }

        const noticeData = { ...req.body };

        if (req.file) {
            noticeData.attachment = req.file.filename;
            noticeData.attachmentOriginalName = req.file.originalname;
        }

        if (req.user) {
            noticeData.createdBy = req.user.id;
            noticeData.publishedBy = req.user.fullName || req.user.role || "Admin";
        }

        const notice = await Notice.create(noticeData);

        notifyAudience({

            audience: notice.audience || "All",

            title: "New Notice",
            message: notice.title,

            type: "notice",
            link: "/notices"

        });

        res.status(201).json({
            success: true,
            message: "Notice Created Successfully",
            notice
        });

    } catch (error) {

        console.log("CREATE NOTICE ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// Get All Notices (filterable)
// GET /api/notices/all
// ======================================================

const getAllNotices = async (req, res) => {

    try {

        const filter = { isArchived: false };

        if (req.query.category) filter.category = req.query.category;
        if (req.query.priority) filter.priority = req.query.priority;
        if (req.query.audience) filter.audience = { $in: [req.query.audience, "All"] };

        const notices = await Notice.find(filter)
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notices.length,
            notices
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// Get Notice By ID
// GET /api/notices/:id
// ======================================================

const getNoticeById = async (req, res) => {

    try {

        const notice = await Notice.findByIdAndUpdate(

            req.params.id,
            { $inc: { views: 1 } },
            { new: true }

        );

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: "Notice Not Found"
            });
        }

        res.status(200).json({
            success: true,
            notice
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// Update Notice
// PUT /api/notices/:id
// ======================================================

const updateNotice = async (req, res) => {

    try {

        if (!isAdmin(req.user) && req.user.role === "teacher") {

            const authorized = await isClassTeacherOfAnyClass(req.user.id);

            if (!authorized) {

                return res.status(403).json({
                    success: false,
                    message: "Only Class Teachers can edit notices."
                });

            }

        }

        const updateData = { ...req.body };

        if (req.file) {
            updateData.attachment = req.file.filename;
            updateData.attachmentOriginalName = req.file.originalname;
        }

        const notice = await Notice.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: "Notice Not Found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Notice Updated",
            notice
        });

    } catch (error) {

        console.log("UPDATE NOTICE ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// Delete Notice
// DELETE /api/notices/:id
// ======================================================

const deleteNotice = async (req, res) => {

    try {

        if (!isAdmin(req.user)) {

            return res.status(403).json({
                success: false,
                message: "Only Admin can delete notices."
            });

        }

        const notice = await Notice.findById(req.params.id);

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: "Notice Not Found"
            });
        }

        await notice.deleteOne();

        res.status(200).json({
            success: true,
            message: "Notice Deleted"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// Search Notices
// GET /api/notices/search?keyword=
// ======================================================

const searchNotices = async (req, res) => {

    try {

        const keyword = req.query.keyword || "";

        const notices = await Notice.find({

            isArchived: false,

            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ]

        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notices.length,
            notices
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// Get Notices By Audience (for student/teacher notice board)
// GET /api/notices/audience/:role
// ======================================================

const getNoticesByAudience = async (req, res) => {

    try {

        const role = req.params.role;

        const now = new Date();

        const notices = await Notice.find({

            isArchived: false,

            audience: { $in: [role, "All"] },

            publishDate: { $lte: now },

            $or: [
                { expiryDate: null },
                { expiryDate: { $gte: now } }
            ]

        }).sort({ priority: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notices.length,
            notices
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// Archive Notice
// PUT /api/notices/:id/archive
// ======================================================

const archiveNotice = async (req, res) => {

    try {

        if (!isAdmin(req.user) && req.user.role === "teacher") {

            const authorized = await isClassTeacherOfAnyClass(req.user.id);

            if (!authorized) {

                return res.status(403).json({
                    success: false,
                    message: "Only Admin or Class Teachers can archive notices."
                });

            }

        }

        const notice = await Notice.findByIdAndUpdate(
            req.params.id,
            { isArchived: true },
            { new: true }
        );

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: "Notice Not Found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Notice Archived",
            notice
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// Get Archived Notices
// GET /api/notices/archived
// ======================================================

const getArchivedNotices = async (req, res) => {

    try {

        const notices = await Notice.find({ isArchived: true })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: notices.length,
            notices
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// Dashboard Stats
// GET /api/notices/dashboard
// ======================================================

const getNoticeDashboard = async (req, res) => {

    try {

        const totalNotices = await Notice.countDocuments({ isArchived: false });
        const archivedNotices = await Notice.countDocuments({ isArchived: true });
        const urgentNotices = await Notice.countDocuments({ priority: "Urgent", isArchived: false });

        const now = new Date();

        const activeNotices = await Notice.countDocuments({
            isArchived: false,
            publishDate: { $lte: now },
            $or: [
                { expiryDate: null },
                { expiryDate: { $gte: now } }
            ]
        });

        const totalViews = await Notice.aggregate([
            { $group: { _id: null, total: { $sum: "$views" } } }
        ]);

        const categoryWise = await Notice.aggregate([
            { $match: { isArchived: false } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const audienceWise = await Notice.aggregate([
            { $match: { isArchived: false } },
            { $group: { _id: "$audience", count: { $sum: 1 } } }
        ]);

        const recentNotices = await Notice.find({ isArchived: false })
            .sort({ createdAt: -1 })
            .limit(7);

        res.status(200).json({

            success: true,

            stats: {
                totalNotices,
                activeNotices,
                archivedNotices,
                urgentNotices,
                totalViews: totalViews[0]?.total || 0
            },

            categoryWise,
            audienceWise,
            recentNotices

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
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
};