const { z } = require("zod");
const { objectId, dateString } = require("./common.validator");

const timeString = (label) =>
    z
        .string({ error: `${label} is required` })
        .regex(
            /^([01]?\d|2[0-3]):[0-5]\d$/,
            `${label} must be in HH:MM format (e.g. 09:30)`
        );

const createScheduleSchema = z
    .object({

        examId: objectId("Exam ID"),

        subject: z
            .string({ error: "Subject is required" })
            .trim()
            .min(1, "Subject is required"),

        examDate: dateString("Exam date"),

        startTime: timeString("Start time"),

        endTime: timeString("End time"),

        totalMarks: z.coerce
            .number({ error: "Total marks is required" })
            .positive("Total marks must be greater than 0"),

        passingMarks: z.coerce
            .number({ error: "Passing marks is required" })
            .min(0, "Passing marks cannot be negative"),

        roomNumber: z.string().optional(),

        notes: z.string().optional()

    })
    .refine(
        (data) => data.passingMarks <= data.totalMarks,
        {
            message: "Passing marks cannot exceed total marks",
            path: ["passingMarks"]
        }
    )
    .refine(
        (data) => data.endTime > data.startTime,
        {
            message: "End time must be after start time",
            path: ["endTime"]
        }
    );

// Same shape, all-optional, without the .refine() (a partial update
// might only touch one field, so the cross-field checks can't be
// applied reliably here — the controller re-fetches + merges before
// saving, same as it does today).

const updateScheduleSchema = z.object({

    examId: objectId("Exam ID").optional(),
    subject: z.string().trim().min(1).optional(),
    examDate: dateString("Exam date").optional(),
    startTime: timeString("Start time").optional(),
    endTime: timeString("End time").optional(),
    totalMarks: z.coerce.number().positive().optional(),
    passingMarks: z.coerce.number().min(0).optional(),
    roomNumber: z.string().optional(),
    notes: z.string().optional()

});

module.exports = {
    createScheduleSchema,
    updateScheduleSchema
};