const HomeworkSubmission = require("../models/HomeworkSubmission");
const Homework = require("../models/Homework");
const Student = require("../models/Student");
const { notifyUser } = require("../services/notification.service");

// ======================================================
// Submit Homework (student)
// POST /api/homework-submission/submit
// ======================================================

const submitHomework = async (req, res) => {

    try {

        const {
            homeworkId,
            studentId,
            answer
        } = req.body;

        const homework = await Homework.findById(homeworkId);

        if (!homework) {

            return res.status(404).json({

                success: false,
                message: "Homework Not Found"

            });

        }

        // Check if already submitted
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

            // Update existing submission
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
// Get All Submissions For A Homework (teacher/admin)
// GET /api/homework-submission/homework/:homeworkId
// ======================================================

const getSubmissionsByHomework = async (req, res) => {

    try {

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
// GET /api/homework-submission/student/:studentId
// ======================================================

const getMySubmissions = async (req, res) => {

    try {

        const submissions = await HomeworkSubmission.find({

            studentId: req.params.studentId

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
// GET /api/homework-submission/:id
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
// Grade Submission (teacher/admin)
// PUT /api/homework-submission/:id/grade
// ======================================================

const gradeSubmission = async (req, res) => {

    try {

        const { grade, feedback } = req.body;

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
// GET /api/homework-submission/completion/:homeworkId
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