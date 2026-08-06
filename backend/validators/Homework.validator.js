const { z } = require("zod");
const { objectId, dateString } = require("./common.validator");

// ======================================================
// POST /api/homework/add
// Runs through multer (uploadHomework.single) before this,
// so req.body only contains text fields — the file itself
// is handled separately via req.file in the controller.
// ======================================================

const createHomeworkSchema = z.object({

    title: z
        .string({ error: "Title is required" })
        .trim()
        .min(3, "Title must be at least 3 characters"),

    description: z
        .string({ error: "Description is required" })
        .trim()
        .min(5, "Description must be at least 5 characters"),

    subject: z
        .string({ error: "Subject is required" })
        .trim()
        .min(1, "Subject is required"),

    standard: z.coerce
        .number({ error: "Standard is required" })
        .int("Standard must be a whole number")
        .min(1, "Standard must be between 1 and 12")
        .max(12, "Standard must be between 1 and 12"),

    division: z
        .string({ error: "Division is required" })
        .trim()
        .min(1, "Division is required"),

    classId: objectId("Class ID").optional().or(z.literal("")),

    teacherId: objectId("Teacher ID").optional().or(z.literal("")),

    dueDate: dateString("Due date"),

    status: z.enum(["Active", "Closed"]).optional(),

    academicYearId: objectId("Academic year ID").optional().or(z.literal("")),

    totalMarks: z.coerce
        .number()
        .min(0, "Total marks cannot be negative")
        .optional()

});

const updateHomeworkSchema = createHomeworkSchema.partial();

module.exports = {
    createHomeworkSchema,
    updateHomeworkSchema
};