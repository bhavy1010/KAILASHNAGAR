const VideoLibrary = require("../models/VideoLibrary");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const User = require("../models/User");
const { extractYoutubeVideoId } = require("../utils/youtube");
const { checkTeacherPermission } = require("../services/teacherPermission.service");

// ======================================================
// 1. Add Educational YouTube Video (Admin / Teacher)
// POST /api/video-library/add
// ======================================================
exports.addVideo = async (req, res) => {
    try {
        const { title, description, youtubeUrl, targetScope, standard, subject } = req.body;
        const role = req.user.role ? req.user.role.toLowerCase() : "teacher";

        if (!title || !title.trim()) {
            return res.status(400).json({ success: false, message: "Video title is required." });
        }

        if (!youtubeUrl || !youtubeUrl.trim()) {
            return res.status(400).json({ success: false, message: "YouTube URL or Video link is required." });
        }

        const videoId = extractYoutubeVideoId(youtubeUrl);
        if (!videoId) {
            return res.status(400).json({
                success: false,
                message: "Invalid YouTube URL. Please enter a valid YouTube video link."
            });
        }

        // Scope validation
        let finalScope = targetScope || "class_specific";

        // Teachers cannot upload for whole_school — only Admins can
        if (role === "teacher") {
            if (finalScope === "whole_school") {
                return res.status(403).json({
                    success: false,
                    message: "Only Admins can publish videos for the Whole School. Teachers can publish for their assigned class."
                });
            }

            if (!standard) {
                return res.status(400).json({ success: false, message: "Standard is required for class video." });
            }

            // Verify teacher permission for this standard & subject
            const perm = await checkTeacherPermission({
                teacherId: req.user.id,
                role: "teacher",
                subject: subject === "Extra / General" ? null : subject,
                standard: Number(standard)
            });

            if (!perm.authorized) {
                return res.status(403).json({ success: false, message: perm.message });
            }
        }

        // Determine Uploader Name
        let uploaderName = "School Staff";
        if (role === "admin") {
            const adminUser = await User.findById(req.user.id);
            uploaderName = adminUser?.name || "Administrator";
        } else if (role === "teacher") {
            const teacherObj = await Teacher.findById(req.user.id);
            uploaderName = teacherObj?.fullName || "Teacher";
        }

        const video = await VideoLibrary.create({
            title: title.trim(),
            description: (description || "").trim(),
            youtubeUrl: youtubeUrl.trim(),
            youtubeVideoId: videoId,
            targetScope: finalScope,
            standard: finalScope === "whole_school" ? null : Number(standard),
            subject: finalScope === "whole_school" ? "Whole School" : (subject || "Extra / General").trim(),
            uploadedBy: req.user.id,
            uploadedByName: uploaderName,
            uploadedByRole: role
        });

        res.status(201).json({
            success: true,
            message: "Educational video added successfully to Digital Library.",
            video
        });
    } catch (error) {
        console.error("ADD VIDEO ERROR:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to add video." });
    }
};

// ======================================================
// 2. Get Educational Videos (Scoped to User Role & Standard)
// GET /api/video-library/all
// ======================================================
exports.getVideos = async (req, res) => {
    try {
        const role = req.user.role ? req.user.role.toLowerCase() : "student";
        const userId = req.user.id;
        const { standard, subject, targetScope, search } = req.query;

        let query = {};

        // Role-based visibility
        if (role === "student") {
            const student = await Student.findById(userId);
            const studentStd = student?.standard;

            // Student sees Whole School videos OR videos for their standard
            if (studentStd) {
                query.$or = [
                    { targetScope: "whole_school" },
                    { standard: Number(studentStd) }
                ];
            } else {
                query.targetScope = "whole_school";
            }
        } else if (role === "teacher") {
            const teacher = await Teacher.findById(userId);
            const handled = (teacher?.classesHandled || []).map((c) => {
                const m = String(c).match(/\d+/);
                return m ? parseInt(m[0], 10) : null;
            }).filter(Boolean);

            // Teacher sees Whole School videos OR videos for their assigned standards
            if (handled.length > 0) {
                query.$or = [
                    { targetScope: "whole_school" },
                    { standard: { $in: handled } }
                ];
            }
        }

        // Additional Filter parameters
        if (targetScope) {
            query.targetScope = targetScope;
        }

        if (standard && targetScope !== "whole_school") {
            query.standard = Number(standard);
        }

        if (subject) {
            query.subject = { $regex: new RegExp(subject.trim(), "i") };
        }

        if (search && search.trim()) {
            const sRegex = new RegExp(search.trim(), "i");
            query.$and = [
                query.$or ? { $or: query.$or } : {},
                {
                    $or: [
                        { title: sRegex },
                        { description: sRegex },
                        { subject: sRegex },
                        { uploadedByName: sRegex }
                    ]
                }
            ];
            delete query.$or;
        }

        const videos = await VideoLibrary.find(query).sort({ createdAt: -1 });

        res.json({
            success: true,
            videos
        });
    } catch (error) {
        console.error("GET VIDEOS ERROR:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to load videos." });
    }
};

// ======================================================
// 3. Delete Video (Admin or Uploader Teacher)
// DELETE /api/video-library/:id
// ======================================================
exports.deleteVideo = async (req, res) => {
    try {
        const role = req.user.role ? req.user.role.toLowerCase() : "teacher";
        const video = await VideoLibrary.findById(req.params.id);

        if (!video) {
            return res.status(404).json({ success: false, message: "Video not found." });
        }

        // Only Admin or the video creator can delete
        if (role !== "admin" && video.uploadedBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only delete videos uploaded by yourself."
            });
        }

        await video.deleteOne();

        res.json({
            success: true,
            message: "Video deleted successfully from Digital Library."
        });
    } catch (error) {
        console.error("DELETE VIDEO ERROR:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to delete video." });
    }
};
