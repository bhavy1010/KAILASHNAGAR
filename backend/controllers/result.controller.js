const Result = require("../models/Result");
const Exam = require("../models/Exam");
const Student = require("../models/Student");
const ExamSchedule = require("../models/ExamSchedule");

// ======================================================
// Grade calculator helper
// ======================================================

const calculateGrade = (percentage) => {

    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    if (percentage >= 40) return "D";
    return "F";

};

// ======================================================
// Save / Update Marks Entry (upsert)
// POST /api/results/save
// ======================================================

const saveResult = async (req, res) => {

    try {

        const {
            examId,
            studentId,
            subjectResults,
            academicYearId
        } = req.body;

        const exam = await Exam.findById(examId);

        if (!exam) {

            return res.status(404).json({

                success: false,
                message: "Exam Not Found"

            });

        }

        // Validate up front - a subject with totalMarks <= 0 can't
        // produce a meaningful percentage/grade, so reject it with a
        // clear error instead of silently computing NaN -> "F" later.
        const invalidSubject = (subjectResults || []).find(
            (sub) => !(sub.totalMarks > 0)
        );

        if (invalidSubject) {

            return res.status(400).json({

                success: false,

                message:
                    `Subject "${invalidSubject.subjectName || invalidSubject.subject || ""}" must have totalMarks greater than 0`

            });

        }

        // Calculate totals
        let totalMarks = 0;
        let totalObtained = 0;
        let allPassed = true;

        const processedSubjects = subjectResults.map((sub) => {

            const isPassed = sub.marksObtained >= sub.passingMarks;

            if (!isPassed) allPassed = false;

            const subPercent = sub.totalMarks > 0
                ? Math.round(
                    (sub.marksObtained / sub.totalMarks) * 100
                )
                : 0;

            totalMarks += sub.totalMarks;
            totalObtained += sub.marksObtained;

            return {

                ...sub,
                isPassed,
                grade: calculateGrade(subPercent)

            };

        });

        const percentage = totalMarks > 0
            ? Math.round((totalObtained / totalMarks) * 100)
            : 0;

        const resultData = {

            examId,
            studentId,
            standard: exam.standard,
            division: exam.division,
            academicYearId: academicYearId || null,
            subjectResults: processedSubjects,
            totalMarks,
            totalObtained,
            percentage,
            grade: calculateGrade(percentage),
            isPassed: allPassed

        };

        const result = await Result.findOneAndUpdate(

            { examId, studentId },
            resultData,
            { new: true, upsert: true, setDefaultsOnInsert: true }

        );

        res.status(201).json({

            success: true,
            message: "Marks Saved Successfully",
            result

        });

    } catch (error) {

        console.log("SAVE RESULT ERROR:", error);

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Get Class Results (with ranks)
// GET /api/results/class/:examId
// ======================================================

const getClassResults = async (req, res) => {

    try {

        const results = await Result.find({

            examId: req.params.examId

        })
            .populate("studentId", "fullName grNumber photo standard division")
            .sort({ percentage: -1 });

        // Assign ranks
        const rankedResults = results.map((result, index) => ({

            ...result.toObject(),
            rank: index + 1

        }));

        // Update ranks in DB
        await Promise.all(

            results.map((result, index) =>

                Result.findByIdAndUpdate(result._id, { rank: index + 1 })

            )

        );

        res.status(200).json({

            success: true,
            count: rankedResults.length,
            results: rankedResults

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Get Student Result For One Exam
// GET /api/results/student/:studentId/exam/:examId
// ======================================================

const getStudentResult = async (req, res) => {

    try {

        const result = await Result.findOne({

            studentId: req.params.studentId,
            examId: req.params.examId

        })
            .populate("studentId", "fullName grNumber photo standard division gender")
            .populate("examId", "examName examType startDate endDate standard division");

        if (!result) {

            return res.status(404).json({

                success: false,
                message: "Result Not Found"

            });

        }

        res.status(200).json({

            success: true,
            result

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Get All Results For A Student (across all exams)
// GET /api/results/student/:studentId
// ======================================================

const getAllResultsForStudent = async (req, res) => {

    try {

        if (req.user?.role === "student" && req.user.id !== req.params.studentId) {

            return res.status(403).json({

                success: false,
                message: "You are not allowed to view another student's results."

            });

        }

        const results = await Result.find({

            studentId: req.params.studentId

        })
            .populate("examId", "examName examType startDate endDate standard division")
            .sort({ createdAt: -1 });

        res.status(200).json({

            success: true,
            count: results.length,
            results

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Get Result Entry For Marks Entry Screen
// GET /api/results/entry/:examId
// ======================================================

const getMarksEntryData = async (req, res) => {

    try {

        const exam = await Exam.findById(req.params.examId);

        if (!exam) {

            return res.status(404).json({

                success: false,
                message: "Exam Not Found"

            });

        }

        const students = await Student.find({

            standard: exam.standard,
            division: exam.division,
            status: "Active"

        }).sort({ fullName: 1 });

        const schedule = await ExamSchedule.find({

            examId: exam._id

        }).sort({ examDate: 1 });

        const existingResults = await Result.find({

            examId: exam._id

        });

        res.status(200).json({

            success: true,
            exam,
            students,
            schedule,
            existingResults

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Analytics — class performance across exams
// GET /api/results/analytics?standard=&division=
// ======================================================

const getResultAnalytics = async (req, res) => {

    try {

        const { standard, division } = req.query;

        const filter = {};

        if (standard) filter.standard = Number(standard);
        if (division) filter.division = division;

        const results = await Result.find(filter)
            .populate("examId", "examName examType");

        // Exam-wise average
        const examMap = {};

        results.forEach((result) => {

            const examName = result.examId?.examName || "Unknown";
            const key = String(result.examId?._id);

            if (!examMap[key]) {

                examMap[key] = {
                    examName,
                    totalPercent: 0,
                    count: 0,
                    passed: 0
                };

            }

            examMap[key].totalPercent += result.percentage;
            examMap[key].count++;

            if (result.isPassed) examMap[key].passed++;

        });

        const examWise = Object.values(examMap).map((item) => ({

            examName: item.examName,
            avgPercentage: item.count > 0
                ? Math.round(item.totalPercent / item.count)
                : 0,
            passPercent: item.count > 0
                ? Math.round((item.passed / item.count) * 100)
                : 0

        }));

        // Grade distribution
        const gradeMap = { "A+": 0, "A": 0, "B+": 0, "B": 0, "C": 0, "D": 0, "F": 0 };

        results.forEach((result) => {

            if (gradeMap[result.grade] !== undefined) {
                gradeMap[result.grade]++;
            }

        });

        const gradeDistribution = Object.entries(gradeMap).map(

            ([grade, count]) => ({ grade, count })

        );

        res.status(200).json({

            success: true,
            examWise,
            gradeDistribution

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

module.exports = {
    saveResult,
    getClassResults,
    getStudentResult,
    getAllResultsForStudent,
    getMarksEntryData,
    getResultAnalytics
};