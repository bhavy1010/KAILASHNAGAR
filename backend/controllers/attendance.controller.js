// controllers/attendance.controller.js

const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const XLSX = require("xlsx");
// ======================================================
// Mark / Update Class Attendance (Upsert)
// POST /api/attendance/class
// ======================================================

const markClassAttendance = async (req, res) => {

    try {

        const {
            attendanceDate,
            standard,
            division,
            records,
            academicYearId
        } = req.body;

        const attendance = await Attendance.findOneAndUpdate(

            {
                standard,
                division,
                attendanceDate: new Date(attendanceDate)
            },

            {

                attendanceDate: new Date(attendanceDate),
                standard,
                division,
                records,
                academicYearId,

                markedBy: req.user.id,
                markedByRole: req.user.role

            },

            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }

        );

        res.status(201).json({

            success: true,
            message: "Attendance Saved Successfully",
            attendance

        });

    } catch (error) {

        console.log("MARK ATTENDANCE ERROR:");
        console.log(error);

        res.status(500).json({

            success: false,
            message: error.message,
            stack: error.stack

        });

    }

};

// ======================================================
// Get Attendance For Class + Date (used to pre-fill Mark Attendance screen)
// GET /api/attendance/class?standard=&division=&date=
// ======================================================

const getClassAttendance = async (req, res) => {

    try {

        const { standard, division, date } = req.query;

        const attendance = await Attendance.findOne({

            standard,
            division,
            attendanceDate: new Date(date)

        });

        res.status(200).json({

            success: true,
            attendance: attendance || null

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
// GET /api/attendance/dashboard?date=
// ======================================================

const getDashboardStats = async (req, res) => {

    try {

        const date = req.query.date
            ? new Date(req.query.date)
            : new Date();

        date.setHours(0, 0, 0, 0);

        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);

        const totalStudents = await Student.countDocuments({
            status: "Active"
        });

        const todaysAttendance = await Attendance.find({

            attendanceDate: {
                $gte: date,
                $lt: nextDay
            }

        });

        let present = 0;
        let absent = 0;
        let late = 0;
        let leave = 0;

        todaysAttendance.forEach((doc) => {

            doc.records.forEach((record) => {

                if (record.status === "Present") present++;
                else if (record.status === "Absent") absent++;
                else if (record.status === "Late") late++;
                else if (record.status === "Leave") leave++;

            });

        });

        const totalMarked = present + absent + late + leave;

        const attendancePercent = totalMarked > 0
            ? Math.round(((present + late) / totalMarked) * 100)
            : 0;

        res.status(200).json({

            success: true,

            stats: {

                totalStudents,
                present,
                absent,
                late,
                leave,
                attendancePercent

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
// Today's Attendance (flattened student rows)
// GET /api/attendance/today?date=
// ======================================================

const getTodayAttendance = async (req, res) => {

    try {

        const date = req.query.date
            ? new Date(req.query.date)
            : new Date();

        date.setHours(0, 0, 0, 0);

        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);

        const attendanceDocs = await Attendance.find({

            attendanceDate: {
                $gte: date,
                $lt: nextDay
            }

        }).populate("markedBy", "fullName");

        const rows = [];

        attendanceDocs.forEach((doc) => {

            doc.records.forEach((record) => {

                rows.push({

                    studentId: record.studentId,
                    fullName: record.fullName,
                    grNumber: record.grNumber,
                    standard: doc.standard,
                    division: doc.division,
                    status: record.status,
                    remarks: record.remarks,
                    markedAt: record.markedAt,
                    markedBy: doc.markedBy?.fullName || "-"

                });

            });

        });

        res.status(200).json({

            success: true,
            count: rows.length,
            records: rows

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// Attendance History (filterable)
// GET /api/attendance/history?standard=&division=&month=&year=&status=
// ======================================================

const getAttendanceHistory = async (req, res) => {

    try {

        const {
            standard,
            division,
            month,
            year,
            status
        } = req.query;

        const filter = {};

        if (standard) filter.standard = Number(standard);

        if (division) filter.division = division;

        if (month && year) {

            const start = new Date(Number(year), Number(month) - 1, 1);
            const end = new Date(Number(year), Number(month), 1);

            filter.attendanceDate = {
                $gte: start,
                $lt: end
            };

        } else if (year) {

            const start = new Date(Number(year), 0, 1);
            const end = new Date(Number(year) + 1, 0, 1);

            filter.attendanceDate = {
                $gte: start,
                $lt: end
            };

        }

        const attendanceDocs = await Attendance.find(filter)
            .sort({ attendanceDate: -1 });

        let rows = [];

        attendanceDocs.forEach((doc) => {

            doc.records.forEach((record) => {

                rows.push({

                    date: doc.attendanceDate,
                    standard: doc.standard,
                    division: doc.division,
                    fullName: record.fullName,
                    grNumber: record.grNumber,
                    status: record.status,
                    remarks: record.remarks

                });

            });

        });

        if (status) {

            rows = rows.filter((row) => row.status === status);

        }

        res.status(200).json({

            success: true,
            count: rows.length,
            records: rows

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// Student Attendance Report
// GET /api/attendance/student/:studentId?month=&year=
// ======================================================

const getStudentAttendanceReport = async (req, res) => {

    try {

        const { studentId } = req.params;

        const { month, year } = req.query;

        if (req.user?.role === "student" && req.user.id !== studentId) {

            return res.status(403).json({

                success: false,
                message: "You are not allowed to view another student's attendance report."

            });

        }

        const filter = {
            "records.studentId": studentId
        };

        if (month && year) {

            const start = new Date(Number(year), Number(month) - 1, 1);
            const end = new Date(Number(year), Number(month), 1);

            filter.attendanceDate = {
                $gte: start,
                $lt: end
            };

        }

        const attendanceDocs = await Attendance.find(filter)
            .sort({ attendanceDate: 1 });

        const history = [];

        let present = 0;
        let absent = 0;
        let late = 0;
        let leave = 0;

        attendanceDocs.forEach((doc) => {

            const record = doc.records.find(

                (r) => String(r.studentId) === String(studentId)

            );

            if (!record) return;

            history.push({

                date: doc.attendanceDate,
                status: record.status,
                remarks: record.remarks

            });

            if (record.status === "Present") present++;
            else if (record.status === "Absent") absent++;
            else if (record.status === "Late") late++;
            else if (record.status === "Leave") leave++;

        });

        const total = present + absent + late + leave;

        const attendancePercent = total > 0
            ? Math.round(((present + late) / total) * 100)
            : 0;

        res.status(200).json({

            success: true,

            summary: {
                present,
                absent,
                late,
                leave,
                total,
                attendancePercent
            },

            history

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// Class Attendance Report
// GET /api/attendance/class-report?standard=&division=&month=&year=
// ======================================================

const getClassAttendanceReport = async (req, res) => {

    try {

        const { standard, division, month, year } = req.query;

        const filter = {
            standard: Number(standard),
            division
        };

        if (month && year) {

            const start = new Date(Number(year), Number(month) - 1, 1);
            const end = new Date(Number(year), Number(month), 1);

            filter.attendanceDate = {
                $gte: start,
                $lt: end
            };

        }

        const attendanceDocs = await Attendance.find(filter)
            .sort({ attendanceDate: 1 });

        const studentMap = {};

        attendanceDocs.forEach((doc) => {

            doc.records.forEach((record) => {

                const key = String(record.studentId);

                if (!studentMap[key]) {

                    studentMap[key] = {

                        studentId: record.studentId,
                        fullName: record.fullName,
                        grNumber: record.grNumber,
                        present: 0,
                        absent: 0,
                        late: 0,
                        leave: 0

                    };

                }

                if (record.status === "Present") studentMap[key].present++;
                else if (record.status === "Absent") studentMap[key].absent++;
                else if (record.status === "Late") studentMap[key].late++;
                else if (record.status === "Leave") studentMap[key].leave++;

            });

        });

        const students = Object.values(studentMap).map((s) => {

            const total = s.present + s.absent + s.late + s.leave;

            return {

                ...s,

                attendancePercent: total > 0
                    ? Math.round(((s.present + s.late) / total) * 100)
                    : 0

            };

        });

        res.status(200).json({

            success: true,
            totalDays: attendanceDocs.length,
            students

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// Calendar View (one student, one month, day -> status map)
// GET /api/attendance/calendar?studentId=&month=&year=
// ======================================================

const getCalendarAttendance = async (req, res) => {

    try {

        const { studentId, month, year } = req.query;

        const start = new Date(Number(year), Number(month) - 1, 1);
        const end = new Date(Number(year), Number(month), 1);

        const attendanceDocs = await Attendance.find({

            "records.studentId": studentId,

            attendanceDate: {
                $gte: start,
                $lt: end
            }

        });

        const days = {};

        attendanceDocs.forEach((doc) => {

            const record = doc.records.find(

                (r) => String(r.studentId) === String(studentId)

            );

            if (!record) return;

            const day = doc.attendanceDate.getDate();

            days[day] = record.status;

        });

        res.status(200).json({

            success: true,
            days

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// Analytics (class comparison + trends)
// GET /api/attendance/analytics?month=&year=
// ======================================================

const getAttendanceAnalytics = async (req, res) => {

    try {

        const { month, year } = req.query;

        const filter = {};

        if (month && year) {

            const start = new Date(Number(year), Number(month) - 1, 1);
            const end = new Date(Number(year), Number(month), 1);

            filter.attendanceDate = {
                $gte: start,
                $lt: end
            };

        }

        const attendanceDocs = await Attendance.find(filter);

        // Class-wise comparison

        const classMap = {};

        // Daily trend

        const dailyMap = {};

        attendanceDocs.forEach((doc) => {

            const classKey = `Std ${doc.standard} - ${doc.division}`;

            const dayKey = doc.attendanceDate.toISOString().substring(0, 10);

            if (!classMap[classKey]) {

                classMap[classKey] = { present: 0, total: 0 };

            }

            if (!dailyMap[dayKey]) {

                dailyMap[dayKey] = { present: 0, total: 0 };

            }

            doc.records.forEach((record) => {

                classMap[classKey].total++;
                dailyMap[dayKey].total++;

                if (record.status === "Present" || record.status === "Late") {

                    classMap[classKey].present++;
                    dailyMap[dayKey].present++;

                }

            });

        });

        const classComparison = Object.entries(classMap).map(

            ([className, data]) => ({

                className,

                percent: data.total > 0
                    ? Math.round((data.present / data.total) * 100)
                    : 0

            })

        );

        const dailyTrend = Object.entries(dailyMap)

            .sort(([a], [b]) => new Date(a) - new Date(b))

            .map(([date, data]) => ({

                date,

                percent: data.total > 0
                    ? Math.round((data.present / data.total) * 100)
                    : 0

            }));

        res.status(200).json({

            success: true,
            classComparison,
            dailyTrend

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// Export Attendance Report to Excel
// Admin and Teacher only
// ======================================================

const exportAttendanceExcel = async (req, res) => {
    try {
        const {
            standard,
            division,
            month,
            year,
            status
        } = req.query;

        const filter = {};

        if (standard) {
            filter.standard = Number(standard);
        }

        if (division) {
            filter.division = division;
        }

        if (month && year) {
            const start = new Date(
                Number(year),
                Number(month) - 1,
                1
            );

            const end = new Date(
                Number(year),
                Number(month),
                1
            );

            filter.attendanceDate = {
                $gte: start,
                $lt: end
            };

        } else if (year) {
            const start = new Date(Number(year), 0, 1);
            const end = new Date(Number(year) + 1, 0, 1);

            filter.attendanceDate = {
                $gte: start,
                $lt: end
            };
        }

        const attendanceDocs = await Attendance.find(filter)
            .sort({
                attendanceDate: -1
            });

        let excelRows = [];

        attendanceDocs.forEach((doc) => {
            doc.records.forEach((record) => {
                excelRows.push({
                    Date: new Date(
                        doc.attendanceDate
                    ).toLocaleDateString("en-IN"),

                    "Student Name": record.fullName || "",

                    "GR Number": record.grNumber || "",

                    Standard: doc.standard || "",

                    Division: doc.division || "",

                    Status: record.status || "",

                    Remarks: record.remarks || ""
                });
            });
        });

        if (status) {
            excelRows = excelRows.filter(
                (row) => row.Status === status
            );
        }

        const workbook = XLSX.utils.book_new();

        const worksheet = XLSX.utils.json_to_sheet(
            excelRows
        );

        worksheet["!cols"] = [
            { wch: 14 },
            { wch: 28 },
            { wch: 16 },
            { wch: 12 },
            { wch: 12 },
            { wch: 14 },
            { wch: 35 }
        ];

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Attendance Report"
        );

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "buffer"
        });

        const fileName =
            `attendance-report-${Date.now()}.xlsx`;

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${fileName}"`
        );

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.send(excelBuffer);

    } catch (error) {
        console.log("ATTENDANCE EXCEL EXPORT ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {

    markClassAttendance,
    getClassAttendance,
    getDashboardStats,
    getTodayAttendance,
    getAttendanceHistory,
    getStudentAttendanceReport,
    getClassAttendanceReport,
    getCalendarAttendance,
    exportAttendanceExcel,
    getAttendanceAnalytics

};