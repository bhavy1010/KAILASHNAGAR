const { z } = require("zod");
const { objectId } = require("./common.validator");

const createSubjectSchema = z.object({

    subjectName: z
        .string({ error: "Subject name is required" })
        .trim()
        .min(2, "Subject name must be at least 2 characters"),

    subjectCode: z
        .string({ error: "Subject code is required" })
        .trim()
        .min(1, "Subject code is required"),

    teacherId: objectId("Teacher ID").optional().or(z.literal(""))

});

const updateSubjectSchema = createSubjectSchema.partial();

module.exports = {
    createSubjectSchema,
    updateSubjectSchema
};