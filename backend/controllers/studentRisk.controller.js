const {
    calculateStudentRisk,
    calculateClassRisk,
    calculateAllClassesRisk
} = require("../services/studentRisk.service");

// ======================================================
// GET /api/student-risk/:studentId
// Get risk assessment for a single student
// ======================================================

const getStudentRisk = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { academicYearId } = req.query;

        if (req.user.role === "student") {
            const Student = require("../models/Student");
            const student = await Student.findById(req.user.id).lean();
            if (!student || student._id.toString() !== studentId) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. You can only view your own risk assessment."
                });
            }
        }

        const riskAssessment = await calculateStudentRisk(studentId, academicYearId);

        if (!riskAssessment) {
            return res.status(404).json({
                success: false,
                message: "Student not found or risk assessment could not be calculated"
            });
        }

        res.status(200).json({
            success: true,
            data: riskAssessment
        });
    } catch (error) {
        console.error("Error in getStudentRisk:", error);
        res.status(500).json({
            success: false,
            message: "Server error while calculating risk assessment"
        });
    }
};

// ======================================================
// GET /api/student-risk/class/:standard/:division
// Get risk assessment for all students in a class
// ======================================================

const getClassRisk = async (req, res) => {
    try {
        const { standard, division } = req.params;
        const { academicYearId } = req.query;

        const classRisk = await calculateClassRisk(standard, division, academicYearId);

        if (!classRisk) {
            return res.status(500).json({
                success: false,
                message: "Unable to calculate class risk assessment"
            });
        }

        res.status(200).json({
            success: true,
            data: classRisk
        });
    } catch (error) {
        console.error("Error in getClassRisk:", error);
        res.status(500).json({
            success: false,
            message: "Server error while calculating class risk"
        });
    }
};

// ======================================================
// GET /api/student-risk/dashboard
// Get risk summary for all classes, or filter by standard/division
// ======================================================

const getRiskDashboard = async (req, res) => {
    try {
        const { standard, division } = req.query;

        if (standard && division) {
            const classRisk = await calculateClassRisk(Number(standard), division);
            if (!classRisk) {
                return res.status(500).json({
                    success: false,
                    message: "Unable to calculate class risk assessment"
                });
            }
            return res.status(200).json({
                success: true,
                data: {
                    standard: Number(standard),
                    division,
                    ...classRisk.summary,
                    students: classRisk.students
                }
            });
        }

        const dashboardData = await calculateAllClassesRisk();
        res.status(200).json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error("Error in getRiskDashboard:", error);
        res.status(500).json({
            success: false,
            message: "Server error while calculating risk dashboard"
        });
    }
};

module.exports = {
    getStudentRisk,
    getClassRisk,
    getRiskDashboard
};
