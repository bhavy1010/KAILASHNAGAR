const { z } = require("zod");
const { objectId, dateString } = require("./common.validator");

// ======================================================
// POST /api/attendance/class
// Marks/updates a whole class's attendance in one request —
// `records` is one entry per student. Every entry is checked,
// so one malformed row can't corrupt the whole day's data.
// ======================================================

const attendanceRecordSchema = z.object({

    studentId: objectId("Student ID"),

    grNumber: z
        .string({ error: "GR Number is required" })
        .trim()
        .min(1, "GR Number is required"),

    fullName: z
        .string({ error: "Student name is required" })
        .trim()
        .min(1, "Student name is required"),

    status: z.enum(["Present", "Absent", "Late", "Leave"], {
        error: "Status must be Present, Absent, Late or Leave"
    }),

    remarks: z.string().optional()

});

const markClassAttendanceSchema = z.object({

    attendanceDate: dateString("Attendance date"),

    standard: z.coerce
        .number({ error: "Standard is required" })
        .int("Standard must be a whole number")
        .min(1, "Standard must be between 1 and 12")
        .max(12, "Standard must be between 1 and 12"),

    division: z
        .string({ error: "Division is required" })
        .trim()
        .min(1, "Division is required"),

    records: z
        .array(attendanceRecordSchema, {
            error: "Attendance records are required"
        })
        .min(1, "At least one student's attendance is required"),

    academicYearId: objectId("Academic year ID")

});

module.exports = {
    markClassAttendanceSchema
};