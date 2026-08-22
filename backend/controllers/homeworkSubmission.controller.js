const HomeworkSubmission = require("../models/HomeworkSubmission");
const Homework = require("../models/Homework");
const Student = require("../models/Student");
const { notifyUser } = require("../services/notification.service");
const { canViewSubmission, canGradeSubmission, isAdmin, isStudent } = require("../services/authorization.service");

// ======================================================
// Submit Homework (student)
// ======================================================

const submitHomework = async (req, res) => {

    try {

        const {
            homeworkId,
            answer
        } = req.body;

        if (!homeworkId) {
            return res.status(400).json({
                success: false,
                message: "Homework ID is required"
            });
        }

        const homework = await Homework.findById(homeworkId);

        if (!homework) {

            return res.status(404).json({

                success: false,
                message: "Homework Not Found"

            });

        }

        if (isStudent(req.user)) {
            const student = await Student.findById(req.user.id);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: "Student record not found"
                });
            }

            if (student.standard !== homework.standard || student.division !== homework.division) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to submit homework for this class."
                });
            }
        }

        const studentId = req.user.id;

        const existing = await HomeworkSubmission.findOne({

            homeworkId,
            studentId

        });

        const isLate = new Date() > new Date(homework.dueDate);

        const submissionData = {

            homeworkId,
            studentId,
            answer: answer || "",
            status: isLate ? "Late" : "Submitted",
            submittedAt: new Date()

        };

        if (req.file) {

            submissionData.fileAttachment = req.file.filename;
            submissionData.fileOriginalName = req.file.originalname;

        }

        let submission;

        if (existing) {

            submission = await HomeworkSubmission.findByIdAndUpdate(

                existing._id,
                submissionData,
                { new: true }

            );

        } else {

            submission = await HomeworkSubmission.create(submissionData);

        }

        res.status(201).json({

            success: true,
            message: isLate
                ? "Submitted (Late)"
                : "Homework Submitted Successfully",
            submission

        });

    } catch (error) {

        console.log("SUBMIT HOMEWORK ERROR:", error);

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Get All Submissions For A Homework
// ======================================================

const getSubmissionsByHomework = async (req, res) => {

    try {

        const homework = await Homework.findById(req.params.homeworkId);

        if (!homework) {
            return res.status(404).json({
                success: false,
                message: "Homework not found"
            });
        }

        if (req.user.role === "teacher" && !isAdmin(req.user)) {
            const authorized = await canViewSubmission(req.user, { _id: homework._id, homeworkId: homework });
            if (!authorized) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to view submissions for this homework."
                });
            }
        }

        const submissions = await HomeworkSubmission.find({

            homeworkId: req.params.homeworkId

        })

            .populate(
                "studentId",
                "fullName grNumber photo standard division"
            )

            .sort({ submittedAt: -1 });

        res.status(200).json({

            success: true,
            count: submissions.length,
            submissions

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Get Student's Own Submissions
// ======================================================

const getMySubmissions = async (req, res) => {

    try {

        const studentId = req.user.id;

        if (req.user.role !== "student") {
            const requestedStudentId = req.params.studentId;
            if (isAdmin(req.user)) {
                const submissions = await HomeworkSubmission.find({

                    studentId: requestedStudentId

                })

                    .populate(
                        "homeworkId",
                        "title subject dueDate totalMarks standard division"
                    )

                    .sort({ createdAt: -1 });

                return res.status(200).json({

                    success: true,
                    count: submissions.length,
                    submissions

                });
            }

            const student = await Student.findById(requestedStudentId);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: "Student not found"
                });
            }

            const Class = require("../models/Class");
            const classDoc = await Class.findOne({ standard: student.standard, division: student.division });

            if (!classDoc || classDoc.classTeacher?.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: "You are only authorized to view submissions for your own students."
                });
            }

            const submissions = await HomeworkSubmission.find({

                studentId: requestedStudentId

            })

                .populate(
                    "homeworkId",
                    "title subject dueDate totalMarks standard division"
                )

                .sort({ createdAt: -1 });

            return res.status(200).json({

                success: true,
                count: submissions.length,
                submissions

            });
        }

        const submissions = await HomeworkSubmission.find({

            studentId: studentId

        })

            .populate(
                "homeworkId",
                "title subject dueDate totalMarks standard division"
            )

            .sort({ createdAt: -1 });

        res.status(200).json({

            success: true,
            count: submissions.length,
            submissions

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Get Single Submission
// ======================================================

const getSubmissionById = async (req, res) => {

    try {

        const submission = await HomeworkSubmission.findById(req.params.id)

            .populate("studentId", "fullName grNumber photo")

            .populate(
                "homeworkId",
                "title subject dueDate totalMarks description"
            );

        if (!submission) {

            return res.status(404).json({

                success: false,
                message: "Submission Not Found"

            });

        }

        if (req.user.role === "student") {
            if (req.user.id !== submission.studentId?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "You can only view your own submissions."
                });
            }
        } else if (req.user.role === "teacher" && !isAdmin(req.user)) {
            const authorized = await canViewSubmission(req.user, submission);
            if (!authorized) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to view this submission."
                });
            }
        }

        res.status(200).json({
            success: true,
            submission
        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Grade Submission
// ======================================================

const gradeSubmission = async (req, res) => {

    try {

        const { grade, feedback } = req.body;

        if (req.user.role === "teacher") {
            const authorized = await canGradeSubmission(req.user, req.params.id);
            if (!authorized) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to grade submissions for this homework."
                });
            }
        }

        const submission = await HomeworkSubmission.findByIdAndUpdate(

            req.params.id,

            {

                grade,
                feedback,
                status: "Graded",
                gradedBy: req.user.id,
                gradedAt: new Date()

            },

            { new: true }

        )

            .populate("studentId", "fullName grNumber")

            .populate("homeworkId", "title totalMarks");

        if (!submission) {

            return res.status(404).json({

                success: false,
                message: "Submission Not Found"

            });

        }

        notifyUser({

            userId: submission.studentId._id,
            userRole: "student",

            title: "Homework Graded",

            message: feedback
                ? `Your submission for "${submission.homeworkId?.title || "a homework"}" was graded: ${grade}/${submission.homeworkId?.totalMarks ?? "?"}. ${feedback}`
                : `Your submission for "${submission.homeworkId?.title || "a homework"}" was graded: ${grade}/${submission.homeworkId?.totalMarks ?? "?"}.`,

            type: "homework",
            link: "/homework"

        });

        res.status(200).json({

            success: true,
            message: "Submission Graded",
            submission

        });

    } catch (error) {

        console.log("GRADE SUBMISSION ERROR:", error);

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Get Homework Completion Stats
// ======================================================

const getHomeworkCompletion = async (req, res) => {

    try {

        const homework = await Homework.findById(
            req.params.homeworkId
        );

        if (!homework) {

            return res.status(404).json({
                success: false,
                message: "Homework Not Found"
            });

        }

        if (req.user.role === "teacher" && !isAdmin(req.user)) {
            const authorized = await canViewSubmission(req.user, { _id: homework._id, homeworkId: homework });
            if (!authorized) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to view completion stats for this homework."
                });
            }
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

        const lateCount = await HomeworkSubmission.countDocuments({

            homeworkId: homework._id,
            status: "Late"

        });

        res.status(200).json({

            success: true,
            totalStudents,
            submittedCount,
            gradedCount,
            lateCount,
            pendingCount: totalStudents - submittedCount,

            completionPercent: totalStudents > 0
                ? Math.round((submittedCount / totalStudents) * 100)
                : 0

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

module.exports = {

    submitHomework,
    getSubmissionsByHomework,
    getMySubmissions,
    getSubmissionById,
    gradeSubmission,
    getHomeworkCompletion

};