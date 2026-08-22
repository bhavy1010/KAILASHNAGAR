const Homework = require("../models/Homework");
const HomeworkSubmission = require("../models/HomeworkSubmission");
const Student = require("../models/Student");
const { notifyStudentsByClass } = require("../services/notification.service");
const { checkTeacherPermission } = require("../services/teacherPermission.service");
const { canManageHomework, canDeleteHomework, isAdmin, isStudent } = require("../services/authorization.service");

// ======================================================
// Create Homework
// ======================================================

const createHomework = async (req, res) => {

    try {

        const homeworkData = { ...req.body };

        if (req.user.role === "teacher") {
            const perm = await checkTeacherPermission({
                teacherId: req.user.id,
                role: req.user.role,
                subject: homeworkData.subject,
                standard: homeworkData.standard,
                division: homeworkData.division
            });
            if (!perm.authorized) {
                return res.status(403).json({ success: false, message: perm.message });
            }

            homeworkData.teacherId = req.user.id;
        }

        if (req.file) {
            homeworkData.attachment = req.file.filename;
            homeworkData.attachmentOriginalName = req.file.originalname;
        }

        const homework = await Homework.create(homeworkData);

        notifyStudentsByClass({

            standard: homework.standard,
            division: homework.division,

            title: "New Homework Assigned",
            message: `${homework.subject}: "${homework.title}" — due ${new Date(homework.dueDate).toLocaleDateString("en-IN")}.`,

            type: "homework",
            link: "/homework"

        });

        res.status(201).json({

            success: true,
            message: "Homework Created Successfully",
            homework

        });

    } catch (error) {

        console.log("CREATE HOMEWORK ERROR:", error);

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Get All Homework
// ======================================================

const getAllHomework = async (req, res) => {

    try {

        const filter = {};

        if (req.user.role === "teacher" && !isAdmin(req.user)) {
            const teacher = await require("../models/Teacher").findById(req.user.id).select("subject subjectsHandled classesHandled");
            if (!teacher) {
                return res.status(403).json({ success: false, message: "Teacher not found" });
            }

            const assignedSubjects = [
                teacher.subject,
                ...(teacher.subjectsHandled || [])
            ]
                .filter(Boolean)
                .map((s) => s.trim());

            const classConditions = [];
            if (teacher.classesHandled && teacher.classesHandled.length > 0) {
                for (const ch of teacher.classesHandled) {
                    const parts = String(ch).trim().toLowerCase().replace(/std|class/gi, "").trim().split(/[\s-]+/);
                    const stdNum = parseInt(parts[0], 10);
                    const div = parts[1] || "";
                    if (!isNaN(stdNum) && div) {
                        classConditions.push({ standard: stdNum, division: div });
                    }
                }
            }

            const formalClassTeacherClasses = [];
            const Class = require("../models/Class");
            const classDocs = await Class.find({ classTeacher: req.user.id });
            for (const cd of classDocs) {
                classConditions.push({ standard: cd.standard, division: cd.division });
            }

            if (classConditions.length > 0) {
                filter.$or = [
                    ...classConditions.map(c => ({ ...c })),
                    ...(assignedSubjects.length > 0 ? [{ subject: { $in: assignedSubjects } }] : [])
                ];
            } else if (assignedSubjects.length > 0) {
                filter.subject = { $in: assignedSubjects };
            } else {
                filter.teacherId = req.user.id;
            }
        }

        if (req.query.standard)
            filter.standard = Number(req.query.standard);

        if (req.query.division)
            filter.division = req.query.division;

        if (req.query.subject && !isAdmin(req.user))
            filter.subject = req.query.subject;

        if (req.query.status)
            filter.status = req.query.status;

        if (req.query.teacherId && isAdmin(req.user))
            filter.teacherId = req.query.teacherId;

        const homework = await Homework.find(filter)

            .populate("classId", "className standard division")

            .populate("teacherId", "fullName subject")

            .populate("academicYearId", "year")

            .sort({ createdAt: -1 });

        res.status(200).json({

            success: true,
            count: homework.length,
            homework

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Get Homework By ID
// ======================================================

const getHomeworkById = async (req, res) => {

    try {

        const homework = await Homework.findById(req.params.id)

            .populate("classId", "className standard division")

            .populate("teacherId", "fullName subject photo")

            .populate("academicYearId", "year");

        if (!homework) {

            return res.status(404).json({

                success: false,
                message: "Homework Not Found"

            });

        }

        const totalStudents = await Student.countDocuments({

            standard: homework.standard,
            division: homework.division,
            status: "Active"

        });

        const submittedCount = await HomeworkSubmission.countDocuments({

            homeworkId: homework._id,
            status: { $in: ["Submitted", "Graded", "Late"] }

        });

        const gradedCount = await HomeworkSubmission.countDocuments({

            homeworkId: homework._id,
            status: "Graded"

        });

        res.status(200).json({

            success: true,
            homework,

            stats: {

                totalStudents,
                submittedCount,
                gradedCount,
                pendingCount: totalStudents - submittedCount,

                submissionPercent: totalStudents > 0
                    ? Math.round((submittedCount / totalStudents) * 100)
                    : 0

            }

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Get Homework By Class
// ======================================================

const getHomeworkByClass = async (req, res) => {

    try {

        const classId = req.params.classId;
        const Class = require("../models/Class");
        const classDoc = await Class.findById(classId);

        if (!classDoc) {
            return res.status(404).json({
                success: false,
                message: "Class not found"
            });
        }

        if (req.user.role === "teacher" && !isAdmin(req.user)) {
            const authorized = await canManageHomework(req.user, null);
            if (!authorized) {
                const perm = await checkTeacherPermission({
                    teacherId: req.user.id,
                    role: req.user.role,
                    standard: classDoc.standard,
                    division: classDoc.division
                });
                if (!perm.authorized) {
                    return res.status(403).json({ success: false, message: perm.message });
                }
            }
        }

        const homework = await Homework.find({

            classId: classId

        })

            .populate("teacherId", "fullName subject")

            .sort({ dueDate: 1 });

        res.status(200).json({

            success: true,
            count: homework.length,
            homework

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Get Homework For Student (by their standard + division)
// ======================================================

const getHomeworkForStudent = async (req, res) => {

    try {

        const student = await Student.findById(req.params.studentId);

        if (!student) {

            return res.status(404).json({

                success: false,
                message: "Student Not Found"

            });

        }

        if (isStudent(req.user) && req.user.id !== student._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You can only view your own homework."
            });
        }

        const homework = await Homework.find({

            standard: student.standard,
            division: student.division,
            status: "Active"

        })

            .populate("teacherId", "fullName subject")

            .sort({ dueDate: 1 });

        const homeworkWithStatus = await Promise.all(

            homework.map(async (hw) => {

                const submission = await HomeworkSubmission.findOne({

                    homeworkId: hw._id,
                    studentId: student._id

                });

                return {

                    ...hw.toObject(),

                    submission: submission || null,

                    submissionStatus: submission?.status || "Pending"

                };

            })

        );

        res.status(200).json({

            success: true,
            count: homeworkWithStatus.length,
            homework: homeworkWithStatus

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Update Homework
// ======================================================

const updateHomework = async (req, res) => {

    try {

        const updateData = { ...req.body };

        if (req.user.role === "teacher") {
            if (!req.body.subject || !req.body.standard || !req.body.division) {
                const existing = await Homework.findById(req.params.id);
                if (existing) {
                    updateData.subject = existing.subject;
                    updateData.standard = existing.standard;
                    updateData.division = existing.division;
                }
            }

            const perm = await checkTeacherPermission({
                teacherId: req.user.id,
                role: req.user.role,
                subject: updateData.subject,
                standard: updateData.standard,
                division: updateData.division
            });
            if (!perm.authorized) {
                return res.status(403).json({ success: false, message: perm.message });
            }

            if (!updateData.teacherId) {
                updateData.teacherId = req.user.id;
            }
        }

        if (req.file) {
            updateData.attachment = req.file.filename;
            updateData.attachmentOriginalName = req.file.originalname;
        }

        const homework = await Homework.findByIdAndUpdate(

            req.params.id,
            updateData,
            { new: true, runValidators: true }

        );

        if (!homework) {

            return res.status(404).json({

                success: false,
                message: "Homework Not Found"

            });

        }

        res.status(200).json({
            success: true,
            message: "Homework Updated",
            homework
        });

    } catch (error) {

        console.log("UPDATE HOMEWORK ERROR:", error);

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Delete Homework
// ======================================================

const deleteHomework = async (req, res) => {

    try {

        if (req.user.role === "teacher") {
            const authorized = await canDeleteHomework(req.user, req.params.id);
            if (!authorized) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to delete this homework."
                });
            }
        }

        const homework = await Homework.findById(req.params.id);

        if (!homework) {

            return res.status(404).json({

                success: false,
                message: "Homework Not Found"

            });

        }

        await HomeworkSubmission.deleteMany({

            homeworkId: homework._id

        });

        await homework.deleteOne();

        res.status(200).json({

            success: true,
            message: "Homework Deleted"

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
// ======================================================

const getHomeworkDashboard = async (req, res) => {

    try {

        const filter = {};

        if (req.user.role === "teacher" && !isAdmin(req.user)) {
            const teacher = await require("../models/Teacher").findById(req.user.id).select("subject subjectsHandled classesHandled");
            if (!teacher) {
                return res.status(403).json({ success: false, message: "Teacher not found" });
            }

            const assignedSubjects = [
                teacher.subject,
                ...(teacher.subjectsHandled || [])
            ]
                .filter(Boolean)
                .map((s) => s.trim());

            const classConditions = [];
            if (teacher.classesHandled && teacher.classesHandled.length > 0) {
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
            const classDocs = await Class.find({ classTeacher: req.user.id });
            for (const cd of classDocs) {
                classConditions.push({ standard: cd.standard, division: cd.division });
            }

            if (classConditions.length > 0) {
                filter.$or = [
                    ...classConditions.map(c => ({ ...c })),
                    ...(assignedSubjects.length > 0 ? [{ subject: { $in: assignedSubjects } }] : [])
                ];
            } else if (assignedSubjects.length > 0) {
                filter.subject = { $in: assignedSubjects };
            } else {
                filter.teacherId = req.user.id;
            }
        }

        const totalHomework = await Homework.countDocuments(filter);

        const activeHomework = await Homework.countDocuments({

            ...filter,
            status: "Active"

        });

        const overdueHomework = await Homework.countDocuments({

            ...filter,
            status: "Active",
            dueDate: { $lt: new Date() }

        });

        const totalSubmissions = await HomeworkSubmission.countDocuments({

            status: { $in: ["Submitted", "Graded", "Late"] }

        });

        const gradedSubmissions = await HomeworkSubmission.countDocuments({

            status: "Graded"

        });

        const recentHomework = await Homework.find(filter)

            .populate("teacherId", "fullName")

            .sort({ createdAt: -1 })

            .limit(7);

        const subjectWise = await Homework.aggregate([

            {
                $match: filter
            },
            {
                $group: {
                    _id: "$subject",
                    count: { $sum: 1 }
                }
            },

            { $sort: { count: -1 } },

            { $limit: 8 }

        ]);

        res.status(200).json({

            success: true,

            stats: {

                totalHomework,
                activeHomework,
                overdueHomework,
                totalSubmissions,
                gradedSubmissions,
                pendingGrading: totalSubmissions - gradedSubmissions

            },

            recentHomework,
            subjectWise

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

module.exports = {

    createHomework,
    getAllHomework,
    getHomeworkById,
    getHomeworkByClass,
    getHomeworkForStudent,
    updateHomework,
    deleteHomework,
    getHomeworkDashboard

};