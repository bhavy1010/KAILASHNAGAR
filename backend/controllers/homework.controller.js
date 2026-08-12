const Homework = require("../models/Homework");
const HomeworkSubmission = require("../models/HomeworkSubmission");
const Student = require("../models/Student");
const { notifyStudentsByClass } = require("../services/notification.service");
const { checkTeacherPermission } = require("../services/teacherPermission.service");

// ======================================================
// Create Homework
// POST /api/homework/add
// ======================================================

const createHomework = async (req, res) => {

    try {

        const homeworkData = { ...req.body };

        // Teacher subject & class permission check
        if (req.user && req.user.role === "teacher") {
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
// Get All Homework (admin/teacher list)
// GET /api/homework/all
// ======================================================

const getAllHomework = async (req, res) => {

    try {

        const filter = {};

        if (req.query.standard)
            filter.standard = Number(req.query.standard);

        if (req.query.division)
            filter.division = req.query.division;

        if (req.query.subject)
            filter.subject = req.query.subject;

        if (req.query.status)
            filter.status = req.query.status;

        if (req.query.teacherId)
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
// GET /api/homework/:id
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

        // Submission stats
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
// GET /api/homework/class/:classId
// ======================================================

const getHomeworkByClass = async (req, res) => {

    try {

        const homework = await Homework.find({

            classId: req.params.classId

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
// GET /api/homework/student/:studentId
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

        const homework = await Homework.find({

            standard: student.standard,
            division: student.division,
            status: "Active"

        })

            .populate("teacherId", "fullName subject")

            .sort({ dueDate: 1 });

        // Attach submission status for each homework
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
// PUT /api/homework/:id
// ======================================================

const updateHomework = async (req, res) => {

    try {

        const updateData = { ...req.body };

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
// DELETE /api/homework/:id
// ======================================================

const deleteHomework = async (req, res) => {

    try {

        const homework = await Homework.findById(req.params.id);

        if (!homework) {

            return res.status(404).json({

                success: false,
                message: "Homework Not Found"

            });

        }

        // Also delete all related submissions
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
// GET /api/homework/dashboard
// ======================================================

const getHomeworkDashboard = async (req, res) => {

    try {

        const totalHomework = await Homework.countDocuments();

        const activeHomework = await Homework.countDocuments({

            status: "Active"

        });

        const overdueHomework = await Homework.countDocuments({

            status: "Active",
            dueDate: { $lt: new Date() }

        });

        const totalSubmissions = await HomeworkSubmission.countDocuments({

            status: { $in: ["Submitted", "Graded", "Late"] }

        });

        const gradedSubmissions = await HomeworkSubmission.countDocuments({

            status: "Graded"

        });

        // Recent homework (last 7)
        const recentHomework = await Homework.find()

            .populate("teacherId", "fullName")

            .sort({ createdAt: -1 })

            .limit(7);

        // Subject-wise count
        const subjectWise = await Homework.aggregate([

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