const { z } = require("zod");
const { dateString } = require("./common.validator");

const createAcademicYearSchema = z
    .object({

        yearName: z
            .string({ error: "Year name is required" })
            .trim()
            .min(4, "Year name is required (e.g. \"2025-2026\")"),

        startDate: dateString("Start date"),

        endDate: dateString("End date"),

        isActive: z.boolean().optional()

    })
    .refine(
        (data) => new Date(data.endDate) >= new Date(data.startDate),
        {
            message: "End date cannot be before start date",
            path: ["endDate"]
        }
    );

const updateAcademicYearSchema = z.object({

    yearName: z.string().trim().min(4).optional(),
    startDate: dateString("Start date").optional(),
    endDate: dateString("End date").optional(),
    isActive: z.boolean().optional()

});

module.exports = {
    createAcademicYearSchema,
    updateAcademicYearSchema
};