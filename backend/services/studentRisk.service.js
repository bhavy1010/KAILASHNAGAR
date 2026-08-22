const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Result = require("../models/Result");
const Homework = require("../models/Homework");
const HomeworkSubmission = require("../models/HomeworkSubmission");
const QuizAttempt = require("../models/QuizAttempt");

// ======================================================
// Risk Level Labels
// ======================================================

const RISK_LEVELS = {
    LOW: { min: 0, max: 24, label: "Low Risk", color: "emerald" },
    MEDIUM: { min: 25, max: 49, label: "Medium Risk", color: "amber" },
    HIGH: { min: 50, max: 74, label: "High Risk", color: "orange" },
    CRITICAL: { min: 75, max: 100, label: "Critical Risk", color: "rose" }
};

// ======================================================
// Helpers
// ======================================================

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const round = (value, decimals = 1) => {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
};

const getRiskLevel = (score) => {
    const clampedScore = clamp(score, 0, 100);
    for (const [key, config] of Object.entries(RISK_LEVELS)) {
        if (clampedScore >= config.min && clampedScore <= config.max) {
            return { key, ...config, score: clampedScore };
        }
    }
    return { key: "LOW", ...RISK_LEVELS.LOW, score: clampedScore };
};

const getTrendDirection = (change) => {
    if (change > 5) return { direction: "declining", label: "Significant decline" };
    if (change > 2) return { direction: "declining", label: "Small decline" };
    if (change < -5) return { direction: "improving", label: "Strongly improving" };
    if (change < -2) return { direction: "improving", label: "Slightly improving" };
    return { direction: "stable", label: "Stable" };
};

// ======================================================
// Attendance Calculation
// ======================================================

const calculateAttendanceRisk = async (studentId, standard, division, academicYearId, bulkAttendance = null) => {
    try {
        let attendanceRecords = bulkAttendance;

        if (!attendanceRecords) {
            const query = {
                standard,
                division,
                "records.studentId": studentId
            };

            if (academicYearId) {
                query.academicYearId = academicYearId;
            }

            attendanceRecords = await Attendance.find(query).lean();
        }

        if (!attendanceRecords || !attendanceRecords.length) {
            return {
                available: false,
                percentage: 0,
                score: 0,
                message: "No attendance records found"
            };
        }

        let totalRecords = 0;
        let presentCount = 0;

        for (const record of attendanceRecords) {
            const studentRecord = record.records.find(
                (r) => r.studentId.toString() === studentId.toString()
            );

            if (studentRecord) {
                totalRecords++;
                if (
                    studentRecord.status === "Present" ||
                    studentRecord.status === "Late"
                ) {
                    presentCount++;
                }
            }
        }

        if (totalRecords === 0) {
            return {
                available: false,
                percentage: 0,
                score: 0,
                message: "No attendance records found for this student"
            };
        }

        const percentage = round((presentCount / totalRecords) * 100, 1);

        let score = 0;
        if (percentage >= 90) score = 0;
        else if (percentage >= 80) score = 5;
        else if (percentage >= 70) score = 12;
        else if (percentage >= 60) score = 20;
        else score = 30;

        return {
            available: true,
            percentage,
            score,
            totalRecords,
            presentCount
        };
    } catch (error) {
        console.error("Attendance risk calculation error:", error);
        return {
            available: false,
            percentage: 0,
            score: 0,
            message: "Error calculating attendance risk"
        };
    }
};

// ======================================================
// Academic Performance Calculation
// ======================================================

const calculateAcademicRisk = async (studentId, standard, division, academicYearId, bulkResults = null) => {
    try {
        let results = bulkResults;

        if (!results) {
            const query = { studentId };

            if (academicYearId) {
                query.academicYearId = academicYearId;
            }

            results = await Result.find(query)
                .sort({ "createdAt": -1 })
                .lean();
        }

        if (!results || !results.length) {
            return {
                available: false,
                percentage: 0,
                score: 0,
                message: "No exam results found"
            };
        }

        const latestResult = results[0];
        const latestPercentage = latestResult.percentage || 0;

        let score = 0;
        if (latestPercentage >= 80) score = 0;
        else if (latestPercentage >= 70) score = 5;
        else if (latestPercentage >= 60) score = 12;
        else if (latestPercentage >= 50) score = 22;
        else score = 30;

        const failedSubjects = latestResult.subjectResults?.filter((s) => !s.isPassed) || [];

        if (failedSubjects.length > 0) {
            score = Math.min(score + failedSubjects.length * 5, 30);
        }

        const weakSubjects = (latestResult.subjectResults || [])
            .filter((s) => {
                const subjectPercentage = s.totalMarks > 0 ? (s.marksObtained / s.totalMarks) * 100 : 0;
                return subjectPercentage < 60;
            })
            .map((s) => ({
                subject: s.subject,
                percentage: s.totalMarks > 0 ? round((s.marksObtained / s.totalMarks) * 100, 1) : 0,
                isPassed: s.isPassed
            }))
            .sort((a, b) => a.percentage - b.percentage)
            .slice(0, 3);

        return {
            available: true,
            percentage: round(latestPercentage, 1),
            score: Math.min(score, 35),
            totalExams: results.length,
            failedSubjects: failedSubjects.length,
            weakSubjects
        };
    } catch (error) {
        console.error("Academic risk calculation error:", error);
        return {
            available: false,
            percentage: 0,
            score: 0,
            message: "Error calculating academic risk"
        };
    }
};

// ======================================================
// Trend Calculation
// ======================================================

const calculateTrendRisk = async (studentId, standard, division, academicYearId, bulkResults = null) => {
    try {
        let results = bulkResults;

        if (!results) {
            const query = { studentId };

            if (academicYearId) {
                query.academicYearId = academicYearId;
            }

            results = await Result.find(query)
                .sort({ "createdAt": -1 })
                .lean();
        }

        if (!results || results.length < 2) {
            return {
                available: false,
                change: 0,
                score: 0,
                message: "Insufficient exam history for trend analysis"
            };
        }

        const recentExams = results.slice(0, Math.min(3, results.length));
        const olderExams = results.slice(Math.min(3, results.length), Math.min(6, results.length));

        if (olderExams.length === 0) {
            return {
                available: false,
                change: 0,
                score: 0,
                message: "Need at least 2 exam periods for trend analysis"
            };
        }

        const recentAvg =
            recentExams.reduce((sum, r) => sum + (r.percentage || 0), 0) / recentExams.length;
        const olderAvg =
            olderExams.reduce((sum, r) => sum + (r.percentage || 0), 0) / olderExams.length;

        const change = round(recentAvg - olderAvg, 1);
        const trend = getTrendDirection(change);

        let score = 0;
        if (trend.direction === "improving") score = 0;
        else if (trend.direction === "stable") score = 3;
        else if (change <= -10) score = 20;
        else if (change <= -5) score = 14;
        else score = 8;

        return {
            available: true,
            change,
            direction: trend.direction,
            label: trend.label,
            score: Math.min(score, 20),
            recentAvg: round(recentAvg, 1),
            olderAvg: round(olderAvg, 1)
        };
    } catch (error) {
        console.error("Trend risk calculation error:", error);
        return {
            available: false,
            change: 0,
            score: 0,
            message: "Error calculating trend risk"
        };
    }
};

// ======================================================
// Homework Risk Calculation
// ======================================================

const calculateHomeworkRisk = async (studentId, standard, division, bulkHomework = null, bulkSubmissions = null) => {
    try {
        let homeworks = bulkHomework;

        if (!homeworks) {
            homeworks = await Homework.find({
                standard,
                division,
                status: "Active"
            }).lean();
        }

        if (!homeworks || !homeworks.length) {
            return {
                available: false,
                completionRate: 0,
                score: 0,
                message: "No homework assignments found for this class"
            };
        }

        const homeworkIds = homeworks.map((h) => h._id);

        let submissions = bulkSubmissions;

        if (!submissions) {
            submissions = await HomeworkSubmission.find({
                homeworkId: { $in: homeworkIds },
                studentId
            }).lean();
        }

        const totalAssigned = homeworks.length;
        const submittedCount = submissions.filter(
            (s) => s.status === "Submitted" || s.status === "Graded"
        ).length;
        const lateCount = submissions.filter((s) => s.status === "Late").length;
        const missingCount = totalAssigned - submissions.length;

        const completionRate = totalAssigned > 0 ? round((submittedCount / totalAssigned) * 100, 1) : 0;

        let score = 0;
        if (completionRate >= 90) score = 0;
        else if (completionRate >= 75) score = 3;
        else if (completionRate >= 60) score = 6;
        else if (completionRate >= 50) score = 8;
        else score = 10;

        if (lateCount > totalAssigned * 0.3) {
            score = Math.min(score + 2, 10);
        }

        return {
            available: true,
            completionRate,
            score: Math.min(score, 10),
            totalAssigned,
            submittedCount,
            lateCount,
            missingCount
        };
    } catch (error) {
        console.error("Homework risk calculation error:", error);
        return {
            available: false,
            completionRate: 0,
            score: 0,
            message: "Error calculating homework risk"
        };
    }
};

// ======================================================
// Quiz Risk Calculation
// ======================================================

const calculateQuizRisk = async (studentId, standard, bulkQuizAttempts = null) => {
    try {
        let attempts = bulkQuizAttempts;

        if (!attempts) {
            attempts = await QuizAttempt.find({
                student: studentId,
                standard,
                status: "completed"
            })
                .sort({ completedAt: -1 })
                .lean();
        }

        if (!attempts || !attempts.length) {
            return {
                available: false,
                average: 0,
                score: 0,
                message: "No quiz attempts found"
            };
        }

        const recentAttempts = attempts.slice(0, Math.min(5, attempts.length));
        const average =
            recentAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / recentAttempts.length;

        let score = 0;
        if (average >= 80) score = 0;
        else if (average >= 70) score = 1;
        else if (average >= 60) score = 2;
        else if (average >= 50) score = 3;
        else score = 5;

        return {
            available: true,
            average: round(average, 1),
            score: Math.min(score, 5),
            totalAttempts: attempts.length,
            recentAttempts: recentAttempts.length
        };
    } catch (error) {
        console.error("Quiz risk calculation error:", error);
        return {
            available: false,
            average: 0,
            score: 0,
            message: "Error calculating quiz risk"
        };
    }
};

// ======================================================
// Reasons Generator
// ======================================================

const generateReasons = (factors) => {
    const reasons = [];

    if (factors.attendance.available && factors.attendance.percentage < 75) {
        reasons.push({
            type: "attendance",
            severity: factors.attendance.percentage < 60 ? "high" : "medium",
            title: "Low attendance",
            description: `Attendance is ${factors.attendance.percentage}%`
        });
    }

    if (factors.academic.available && factors.academic.percentage < 60) {
        reasons.push({
            type: "academic",
            severity: factors.academic.percentage < 50 ? "high" : "medium",
            title: "Academic performance is low",
            description: `Latest exam percentage is ${factors.academic.percentage}%`
        });
    }

    if (factors.trend.available && factors.trend.direction === "declining") {
        reasons.push({
            type: "trend",
            severity: factors.trend.change <= -10 ? "high" : "medium",
            title: "Performance is declining",
            description: `Percentage decreased by ${Math.abs(factors.trend.change)} points compared with previous exams`
        });
    }

    if (factors.homework.available && factors.homework.completionRate < 60) {
        reasons.push({
            type: "homework",
            severity: factors.homework.completionRate < 50 ? "high" : "medium",
            title: "Low homework completion",
            description: `Only ${factors.homework.completionRate}% of homework completed`
        });
    }

    if (factors.quiz.available && factors.quiz.average < 60) {
        reasons.push({
            type: "quiz",
            severity: factors.quiz.average < 50 ? "high" : "medium",
            title: "Low quiz performance",
            description: `Average quiz score is ${factors.quiz.average}%`
        });
    }

    if (factors.academic.available && factors.academic.weakSubjects?.length > 0) {
        const topWeak = factors.academic.weakSubjects[0];
        reasons.push({
            type: "subject",
            severity: topWeak.isPassed ? "medium" : "high",
            title: "Weak subject performance",
            description: `${topWeak.subject} average is ${topWeak.percentage}%`
        });
    }

    return reasons;
};

// ======================================================
// Recommendations Generator
// ======================================================

const generateRecommendations = (reasons) => {
    const recommendations = [];

    const attendanceReason = reasons.find((r) => r.type === "attendance");
    if (attendanceReason) {
        recommendations.push(
            "Monitor attendance and contact parent if the pattern continues."
        );
    }

    const academicReason = reasons.find((r) => r.type === "academic");
    if (academicReason) {
        recommendations.push(
            "Review the latest exam topics and provide targeted revision support."
        );
    }

    const trendReason = reasons.find((r) => r.type === "trend");
    if (trendReason) {
        recommendations.push(
            "Schedule a counseling session to understand the cause of declining performance."
        );
    }

    const homeworkReason = reasons.find((r) => r.type === "homework");
    if (homeworkReason) {
        recommendations.push(
            "Follow up on missing homework submissions and set clearer deadlines."
        );
    }

    const quizReason = reasons.find((r) => r.type === "quiz");
    if (quizReason) {
        recommendations.push(
            "Recommend targeted quiz practice for weak areas."
        );
    }

    const subjectReason = reasons.find((r) => r.type === "subject");
    if (subjectReason) {
        recommendations.push(
            "Assign additional practice and resources for the identified weak subject."
        );
    }

    if (recommendations.length === 0) {
        recommendations.push(
            "Student is performing well. Continue regular monitoring."
        );
    }

    return recommendations;
};

// ======================================================
// Group bulk data by studentId
// ======================================================

const groupByStudentId = (items) => {
    const map = new Map();
    for (const item of items) {
        const key = (item.studentId || item.student || item._id).toString();
        if (!map.has(key)) {
            map.set(key, []);
        }
        map.get(key).push(item);
    }
    return map;
};

// ======================================================
// Calculate Risk for a Single Student
// ======================================================

const calculateStudentRisk = async (studentId, academicYearId = null, bulkData = null) => {
    try {
        const student = await Student.findById(studentId).lean();

        if (!student) {
            return null;
        }

        const standard = student.standard;
        const division = student.division;

        const bulkAttendance = bulkData?.attendance?.get(studentId.toString());
        const bulkResults = bulkData?.results?.get(studentId.toString());
        const bulkHomework = bulkData?.homework?.get(standard.toString());
        const bulkSubmissions = bulkData?.submissions?.get(studentId.toString());
        const bulkQuizAttempts = bulkData?.quizAttempts?.get(studentId.toString());

        const [attendance, academic, trend, homework, quiz] = await Promise.all([
            calculateAttendanceRisk(studentId, standard, division, academicYearId, bulkAttendance),
            calculateAcademicRisk(studentId, standard, division, academicYearId, bulkResults),
            calculateTrendRisk(studentId, standard, division, academicYearId, bulkResults),
            calculateHomeworkRisk(studentId, standard, division, bulkHomework, bulkSubmissions),
            calculateQuizRisk(studentId, standard, bulkQuizAttempts)
        ]);

        const factors = {
            attendance: { score: attendance.score, ...attendance },
            academic: { score: academic.score, ...academic },
            trend: { score: trend.score, ...trend },
            homework: { score: homework.score, ...homework },
            quiz: { score: quiz.score, ...quiz }
        };

        const totalScore = attendance.score + academic.score + trend.score + homework.score + quiz.score;

        const availableCount = [
            attendance.available,
            academic.available,
            trend.available,
            homework.available,
            quiz.available
        ].filter(Boolean).length;

        const insufficientData = availableCount < 2;

        const risk = insufficientData
            ? { level: "Insufficient Data", label: "Insufficient Data", score: totalScore }
            : getRiskLevel(totalScore);

        const reasons = generateReasons(factors);
        const recommendations = generateRecommendations(reasons);

        const dataAvailability = {
            attendance: attendance.available,
            academic: academic.available,
            trend: trend.available,
            homework: homework.available,
            quiz: quiz.available
        };

        return {
            student: {
                id: student._id,
                name: student.fullName,
                grNumber: student.grNumber,
                standard: student.standard,
                division: student.division,
                status: student.status
            },
            risk,
            factors,
            reasons,
            weakSubjects: academic.weakSubjects || [],
            recommendations,
            dataAvailability,
            insufficientData
        };
    } catch (error) {
        console.error("Student risk calculation error:", error);
        return null;
    }
};

// ======================================================
// Calculate Risk for a Class (Bulk Optimized)
// ======================================================

const calculateClassRisk = async (standard, division, academicYearId = null) => {
    try {
        const students = await Student.find({
            standard,
            division,
            status: "Active"
        }).lean();

        if (!students.length) {
            return {
                students: [],
                summary: {
                    totalStudents: 0,
                    lowRisk: 0,
                    mediumRisk: 0,
                    highRisk: 0,
                    criticalRisk: 0,
                    insufficientData: 0
                }
            };
        }

        const studentIds = students.map((s) => s._id);

        const activeHomework = await Homework.find({
            standard,
            division,
            status: "Active"
        }).lean();

        const homeworkIds = activeHomework.map((h) => h._id);

        const [attendanceRecords, results, submissions, quizAttempts] = await Promise.all([
            Attendance.find({
                standard,
                division,
                "records.studentId": { $in: studentIds }
            }).lean(),
            Result.find({
                studentId: { $in: studentIds }
            }).sort({ "createdAt": -1 }).lean(),
            HomeworkSubmission.find({
                studentId: { $in: studentIds },
                homeworkId: { $in: homeworkIds }
            }).lean(),
            QuizAttempt.find({
                student: { $in: studentIds }
            }).lean()
        ]);

        const bulkData = {
            attendance: groupByStudentId(attendanceRecords),
            results: groupByStudentId(results),
            homework: new Map([[standard.toString(), activeHomework]]),
            submissions: groupByStudentId(submissions),
            quizAttempts: groupByStudentId(quizAttempts)
        };

        const studentRisks = await Promise.all(
            students.map((student) => calculateStudentRisk(student._id, academicYearId, bulkData))
        );

        const riskList = studentRisks
            .filter((result) => result !== null)
            .map((result) => {
                const { student, risk, factors } = result;
                const topReason = result.reasons[0]?.title || "No major concerns";

                return {
                    studentId: student.id,
                    fullName: student.name,
                    grNumber: student.grNumber,
                    riskLevel: risk.label,
                    riskScore: risk.score,
                    attendancePercentage: factors.attendance.available
                        ? factors.attendance.percentage
                        : null,
                    academicPercentage: factors.academic.available
                        ? factors.academic.percentage
                        : null,
                    trend: factors.trend.available ? factors.trend.label : "N/A",
                    topReason
                };
            })
            .sort((a, b) => {
                if (a.riskLevel === "Insufficient Data" && b.riskLevel !== "Insufficient Data")
                    return 1;
                if (a.riskLevel !== "Insufficient Data" && b.riskLevel === "Insufficient Data")
                    return -1;
                return b.riskScore - a.riskScore;
            });

        const summary = {
            totalStudents: students.length,
            lowRisk: riskList.filter((r) => r.riskLevel === "Low Risk").length,
            mediumRisk: riskList.filter((r) => r.riskLevel === "Medium Risk").length,
            highRisk: riskList.filter((r) => r.riskLevel === "High Risk").length,
            criticalRisk: riskList.filter((r) => r.riskLevel === "Critical Risk").length,
            insufficientData: riskList.filter((r) => r.riskLevel === "Insufficient Data").length
        };

        return {
            students: riskList,
            summary
        };
    } catch (error) {
        console.error("Class risk calculation error:", error);
        return null;
    }
};

// ======================================================
// Calculate Risk for All Classes (Dashboard)
// ======================================================

const calculateAllClassesRisk = async () => {
    try {
        const classes = await Student.distinct("standard").sort((a, b) => a - b);

        const classRiskSummary = [];

        for (const standard of classes) {
            const divisions = await Student.distinct("division", { standard });

            for (const division of divisions) {
                const classRisk = await calculateClassRisk(standard, division);

                if (classRisk) {
                    classRiskSummary.push({
                        standard,
                        division,
                        ...classRisk.summary,
                        students: classRisk.students
                    });
                }
            }
        }

        return classRiskSummary;
    } catch (error) {
        console.error("All classes risk calculation error:", error);
        return [];
    }
};

module.exports = {
    calculateStudentRisk,
    calculateClassRisk,
    calculateAllClassesRisk,
    getRiskLevel,
    RISK_LEVELS
};
