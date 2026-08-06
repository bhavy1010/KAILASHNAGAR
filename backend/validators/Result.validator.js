const { z } = require("zod");
const { objectId } = require("./common.validator");

// ======================================================
// POST /api/results/save
// One document per student per exam, made up of one entry
// per subject. Each subject entry is checked individually —
// in particular marksObtained can never exceed totalMarks,
// which the old manual checks didn't catch at all.
// ======================================================

const subjectResultSchema = z
    .object({

        subject: z
            .string({ error: "Subject name is required" })
            .trim()
            .min(1, "Subject name is required"),

        scheduleId: objectId("Schedule ID").optional().or(z.literal("")),

        totalMarks: z.coerce
            .number({ error: "Total marks is required" })
            .positive("Total marks must be greater than 0"),

        passingMarks: z.coerce
            .number({ error: "Passing marks is required" })
            .min(0, "Passing marks cannot be negative"),

        marksObtained: z.coerce
            .number({ error: "Marks obtained is required" })
            .min(0, "Marks obtained cannot be negative"),

        remarks: z.string().optional()

    })
    .refine(
        (data) => data.marksObtained <= data.totalMarks,
        {
            message: "Marks obtained cannot exceed total marks",
            path: ["marksObtained"]
        }
    )
    .refine(
        (data) => data.passingMarks <= data.totalMarks,
        {
            message: "Passing marks cannot exceed total marks",
            path: ["passingMarks"]
        }
    );

const saveResultSchema = z.object({

    examId: objectId("Exam ID"),

    studentId: objectId("Student ID"),

    academicYearId: objectId("Academic year ID").optional().or(z.literal("")),

    subjectResults: z
        .array(subjectResultSchema, {
            error: "At least one subject's marks are required"
        })
        .min(1, "At least one subject's marks are required")

});

module.exports = {
    saveResultSchema
};