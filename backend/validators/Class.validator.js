const { z } = require("zod");
const { objectId } = require("./common.validator");

const createClassSchema = z.object({

    standard: z.coerce
        .number({ error: "Standard is required" })
        .int("Standard must be a whole number")
        .min(1, "Standard must be between 1 and 12")
        .max(12, "Standard must be between 1 and 12"),

    division: z
        .string({ error: "Division is required" })
        .trim()
        .min(1, "Division is required"),

    className: z
        .string({ error: "Class name is required" })
        .trim()
        .min(1, "Class name is required"),

    classTeacher: objectId("Class teacher ID").optional().or(z.literal("")),

    roomNumber: z.string().optional(),

    status: z.enum(["Active", "Inactive"]).optional()

});

const updateClassSchema = createClassSchema.partial();

module.exports = {
    createClassSchema,
    updateClassSchema
};