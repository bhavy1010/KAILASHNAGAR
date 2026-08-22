const Exam = require("../models/Exam");
const ExamSchedule = require("../models/ExamSchedule");
const Result = require("../models/Result");
const Student = require("../models/Student");
const { canAccessClass, isAdmin, isTeacher } = require("../services/authorization.service");

// ======================================================
// Create Exam
// POST /api/exams/add
// ======================================================

const createExam = async (req, res) => {

    try {

        if (isTeacher(req.user) && !await canAccessClass(req.user, req.body.standard, req.body.division)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to create exams for this class."
            });
        }

        const exam = await Exam.create(req.body);

        res.status(201).json({

            success: true,
            message: "Exam Created Successfully",
            exam

        });

    } catch (error) {

        console.log("CREATE EXAM ERROR:", error);

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Get All Exams (filterable)
// GET /api/exams/all
// ======================================================

const getAllExams = async (req, res) => {

    try {

        const filter = {};

        if (req.query.status) filter.status = req.query.status;
        if (req.query.examType) filter.examType = req.query.examType;

        if (req.user?.role === "student") {

            // Students must only ever see exams for their own class.
            // Their own standard/division is looked up server-side and
            // enforced here so a student cannot view another class's
            // exams by editing query parameters in the request.
            const student = await Student.findById(req.user.id);

            if (!student) {

                return res.status(404).json({

                    success: false,
                    message: "Student Not Found"

                });

            }

            filter.standard = student.standard;
            filter.division = student.division;

        } else if (isTeacher(req.user)) {

        } else {

            if (req.query.standard) filter.standard = Number(req.query.standard);
            if (req.query.division) filter.division = req.query.division;

        }

        const exams = await Exam.find(filter)
            .populate("classId", "className standard division")
            .populate("academicYearId", "yearName")
            .sort({ startDate: -1 });

        let finalExams = exams;

        if (isTeacher(req.user)) {

            finalExams = [];
            for (const exam of exams) {
                const canAccess = await canAccessClass(req.user, exam.standard, exam.division);
                if (canAccess) finalExams.push(exam);
            }

        }

        res.status(200).json({

            success: true,
            count: finalExams.length,
            exams: finalExams

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Get Exam By ID
// GET /api/exams/:id
// ======================================================

const getExamById = async (req, res) => {

    try {

        const exam = await Exam.findById(req.params.id)
            .populate("classId", "className standard division")
            .populate("academicYearId", "yearName");

        if (!exam) {

            return res.status(404).json({

                success: false,
                message: "Exam Not Found"

            });

        }

        if (req.user?.role === "student") {

            const student = await Student.findById(req.user.id);

            if (
                !student ||
                String(student.standard) !== String(exam.standard) ||
                String(student.division) !== String(exam.division)
            ) {

                return res.status(403).json({

                    success: false,
                    message: "You are not allowed to view this exam."

                });

            }

        } else if (isTeacher(req.user)) {

            if (!await canAccessClass(req.user, exam.standard, exam.division)) {

                return res.status(403).json({

                    success: false,
                    message: "You are not allowed to view this exam."

                });

            }

        }

        const schedule = await ExamSchedule.find({
            examId: exam._id
        }).sort({ examDate: 1 });

        const totalStudents = await Student.countDocuments({
            standard: exam.standard,
            division: exam.division,
            status: "Active"
        });

        const resultsEntered = await Result.countDocuments({
            examId: exam._id
        });

        res.status(200).json({

            success: true,
            exam,
            schedule,
            stats: {
                totalStudents,
                resultsEntered,
                scheduleCount: schedule.length
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
// Update Exam
// PUT /api/exams/:id
// ======================================================

const updateExam = async (req, res) => {

    try {

        const existingExam = await Exam.findById(req.params.id);

        if (!existingExam) {

            return res.status(404).json({

                success: false,
                message: "Exam Not Found"

            });

        }

        if (isTeacher(req.user) && !await canAccessClass(req.user, existingExam.standard, existingExam.division)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this exam."
            });
        }

        const exam = await Exam.findByIdAndUpdate(

            req.params.id,
            req.body,
            { new: true, runValidators: true }

        );

        if (!exam) {

            return res.status(404).json({

                success: false,
                message: "Exam Not Found"

            });

        }

        res.status(200).json({

            success: true,
            message: "Exam Updated",
            exam

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Delete Exam
// DELETE /api/exams/:id
// ======================================================

const deleteExam = async (req, res) => {

    try {

        const exam = await Exam.findById(req.params.id);

        if (!exam) {

            return res.status(404).json({

                success: false,
                message: "Exam Not Found"

            });

        }

        if (isTeacher(req.user) && !await canAccessClass(req.user, exam.standard, exam.division)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this exam."
            });
        }

        await ExamSchedule.deleteMany({ examId: exam._id });
        await Result.deleteMany({ examId: exam._id });
        await exam.deleteOne();

        res.status(200).json({

            success: true,
            message: "Exam Deleted"

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
// GET /api/exams/dashboard
// ======================================================

const getExamDashboard = async (req, res) => {

    try {

        let exams = await Exam.find();

        if (isTeacher(req.user)) {
            const filtered = [];
            for (const exam of exams) {
                if (await canAccessClass(req.user, exam.standard, exam.division)) {
                    filtered.push(exam);
                }
            }
            exams = filtered;
        }

        const totalExams = exams.length;
        const upcomingExams = exams.filter(e => e.status === "Upcoming").length;
        const ongoingExams = exams.filter(e => e.status === "Ongoing").length;
        const completedExams = exams.filter(e => e.status === "Completed").length;

        const examIds = exams.map(e => e._id);
        const totalResults = examIds.length > 0
            ? await Result.countDocuments({ examId: { $in: examIds } })
            : 0;

        const recentExams = exams
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 7);

        // Exam type wise count
        const examTypeMap = {};
        exams.forEach(exam => {
            const type = exam.examType || "Unknown";
            examTypeMap[type] = (examTypeMap[type] || 0) + 1;
        });
        const examTypeWise = Object.entries(examTypeMap)
            .map(([examType, count]) => ({ examType, count }))
            .sort((a, b) => b.count - a.count);

        // Average percentage from results
        const avgResult = examIds.length > 0
            ? await Result.aggregate([
                { $match: { examId: { $in: examIds } } },
                { $group: { _id: null, avgPercentage: { $avg: "$percentage" } } }
            ])
            : [];
        const avgPercentage = avgResult.length > 0
            ? Math.round(avgResult[0].avgPercentage)
            : 0;

        res.status(200).json({

            success: true,
            stats: {
                totalExams,
                upcomingExams,
                ongoingExams,
                completedExams,
                totalResults,
                avgPercentage
            },
            recentExams,
            examTypeWise

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

module.exports = {
    createExam,
    getAllExams,
    getExamById,
    updateExam,
    deleteExam,
    getExamDashboard
};