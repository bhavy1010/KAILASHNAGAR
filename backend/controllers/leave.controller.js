const Leave = require("../models/Leave");
const Teacher = require("../models/Teacher");
const User = require("../models/User");
const Student = require("../models/Student");
const { notifyUser } = require("../services/notification.service");
const { canAccessClass, isAdmin } = require("../services/authorization.service");

// ======================================================
// Apply For Leave (Student only)
// ======================================================

const createLeave = async (req, res) => {

    try {

        if (req.user.role !== "student") {

            // Defense in depth — the route is already locked to the
            // "student" role via roleMiddleware, but a multer error
            // could theoretically reach here before that check in some
            // edge cases, so this stays as a second guard.
            return res.status(403).json({
                success: false,
                message: "Only students can apply for leave"
            });

        }

        const { leaveType, fromDate, toDate, reason } = req.body;

        const leave = await Leave.create({

            studentId: req.user.id,
            leaveType,
            fromDate,
            toDate,
            reason,
            attachment: req.file ? req.file.filename : "",
            status: "Pending",
            seenByStudent: true

        });

        res.status(201).json({

            success: true,
            message: "Leave Request Submitted",
            leave

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// Get Leaves
// Students only see their own leave requests.
// Teachers / Admins see all leave requests (filterable).
// ======================================================

const getLeaves = async (req, res) => {

    try {

        const filter = {};

        if (req.query.status) {

            filter.status = req.query.status;

        }

        if (req.user.role === "student") {

            filter.studentId = req.user.id;

        } else if (req.user.role === "teacher") {

            const teacher = await require("../models/Teacher").findById(req.user.id).select("classesHandled");

            const classConditions = [];

            if (teacher && teacher.classesHandled && teacher.classesHandled.length > 0) {

                for (const ch of teacher.classesHandled) {

                    const parts = String(ch).trim().toLowerCase().replace(/std|class/gi, "").trim().split(/[\s-]+/);

                    const stdNum = parseInt(parts[0], 10);

                    const div = parts[1] || "";

                    if (!isNaN(stdNum) && div) {

                        classConditions.push({ standard: stdNum, division: div });

                    }

                }

            }

            const Class = require("../models/Class");

            const formalClasses = await Class.find({ classTeacher: req.user.id });

            for (const cd of formalClasses) {

                classConditions.push({ standard: cd.standard, division: cd.division });

            }

            if (req.query.studentId) {

                const student = await Student.findById(req.query.studentId);

                if (student && classConditions.some(cc => cc.standard === student.standard && cc.division === student.division)) {

                    filter.studentId = req.query.studentId;

                } else {

                    filter.studentId = { $in: [] };

                }

            } else if (classConditions.length > 0) {

                const studentsInClasses = await Student.find({ $or: classConditions }).select("_id");

                const studentIds = studentsInClasses.map(s => s._id);

                filter.studentId = { $in: studentIds };

            } else {

                filter.studentId = { $in: [] };

            }

        } else if (isAdmin(req.user) && req.query.studentId) {

            filter.studentId = req.query.studentId;

        }

        const leaves = await Leave.find(filter)

            .populate("studentId", "fullName grNumber standard division")

            .sort({ createdAt: -1 });

        // Mark fetched leaves as seen once the student views their list

        if (req.user.role === "student") {

            await Leave.updateMany(
                { studentId: req.user.id, seenByStudent: false },
                { seenByStudent: true }
            );

        }

        res.status(200).json({

            success: true,
            count: leaves.length,
            leaves

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// Approve / Reject Leave (Teacher / Admin only)
// ======================================================

const updateLeaveStatus = async (req, res) => {

    try {

        const { status, remark } = req.body;

        if (!["Approved", "Rejected"].includes(status)) {

            return res.status(400).json({

                success: false,
                message: "Invalid Status"

            });

        }

        let reviewedByName = "";

        if (req.user.role === "teacher") {

            const teacher = await Teacher.findById(req.user.id).select("fullName");
            reviewedByName = teacher?.fullName || "Teacher";

        } else if (req.user.role === "admin") {

            const admin = await User.findById(req.user.id).select("name");
            reviewedByName = admin?.name || "Admin";

        }

        // Fetch the leave first (with the student's class info) so we
        // can check class-teacher authorization before touching it.
        const existingLeave = await Leave.findById(req.params.id)
            .populate("studentId", "standard division");

        if (!existingLeave) {

            return res.status(404).json({
                success: false,
                message: "Leave Request Not Found"
            });

        }

        // Only admins, or the teacher formally assigned as the
        // requesting student's Class Teacher, can approve/reject.
        if (req.user.role === "teacher") {

            const authorized = await canAccessClass(

                req.user,
                existingLeave.studentId?.standard,
                existingLeave.studentId?.division

            );

            if (!authorized) {

                return res.status(403).json({
                    success: false,
                    message: "You are not the assigned Class Teacher for this student, so you can't approve or reject their leave."
                });

            }

        }

        const leave = await Leave.findByIdAndUpdate(

            req.params.id,

            {
                status,
                remark: remark || "",
                reviewedBy: req.user.id,
                reviewedByRole: req.user.role,
                reviewedByName,
                reviewedAt: new Date(),
                seenByStudent: false
            },

            { new: true }

        ).populate("studentId", "fullName grNumber standard division");

        if (!leave) {

            return res.status(404).json({
                success: false,
                message: "Leave Request Not Found"
            });

        }

        notifyUser({

            userId: leave.studentId._id,
            userRole: "student",

            title: `Leave ${status}`,

            message: remark
                ? `Your ${leave.leaveType} request has been ${status.toLowerCase()}. Note: ${remark}`
                : `Your ${leave.leaveType} request has been ${status.toLowerCase()}.`,

            type: "leave",
            link: "/attendance/leaves"

        });

        res.status(200).json({

            success: true,
            message: `Leave ${status}`,
            leave

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    createLeave,
    getLeaves,
    updateLeaveStatus
};