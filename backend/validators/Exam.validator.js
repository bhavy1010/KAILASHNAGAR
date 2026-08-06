const { z } = require("zod");
const { objectId, dateString } = require("./common.validator");

const examTypeEnum = z.enum(
    ["Unit Test", "Mid Term", "Final", "Weekly Test", "Mock Test", "Other"],
    { error: "Please choose a valid exam type" }
);

const createExamSchema = z
    .object({

        examName: z
            .string({ error: "Exam name is required" })
            .trim()
            .min(2, "Exam name must be at least 2 characters"),

        examType: examTypeEnum,

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

        academicYearId: objectId("Academic year ID").optional().or(z.literal("")),

        startDate: dateString("Start date"),

        endDate: dateString("End date"),

        description: z.string().optional(),

        status: z.enum(["Upcoming", "Ongoing", "Completed"]).optional(),

        totalMarks: z.coerce
            .number()
            .min(0, "Total marks cannot be negative")
            .optional(),

        passingMarks: z.coerce
            .number()
            .min(0, "Passing marks cannot be negative")
            .optional()

    })
    .refine(
        (data) => new Date(data.endDate) >= new Date(data.startDate),
        {
            message: "End date cannot be before start date",
            path: ["endDate"]
        }
    );

// .partial() can't be called after .refine() (the refine wraps the
// object, it isn't an object schema anymore) — so the update schema
// re-declares the same fields as all-optional, without the cross-field
// date check (a partial update might only touch one date, or neither).

const updateExamSchema = z.object({

    examName: z.string().trim().min(2).optional(),
    examType: examTypeEnum.optional(),
    standard: z.coerce.number().int().min(1).max(12).optional(),
    division: z.string().trim().min(1).optional(),
    classId: objectId("Class ID").optional().or(z.literal("")),
    academicYearId: objectId("Academic year ID").optional().or(z.literal("")),
    startDate: dateString("Start date").optional(),
    endDate: dateString("End date").optional(),
    description: z.string().optional(),
    status: z.enum(["Upcoming", "Ongoing", "Completed"]).optional(),
    totalMarks: z.coerce.number().min(0).optional(),
    passingMarks: z.coerce.number().min(0).optional()

});

module.exports = {
    createExamSchema,
    updateExamSchema
};