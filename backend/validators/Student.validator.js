const { z } = require("zod");

// ======================================================
// Shared building blocks
// ======================================================

const genderEnum = z.enum(["Male", "Female", "Other"], {
    error: "Gender must be Male, Female or Other"
});

const statusEnum = z.enum(["Active", "Inactive"], {
    error: "Status must be Active or Inactive"
});

// Accepts "YYYY-MM-DD" (HTML date input) or any string a JS
// Date can parse, and rejects nonsense like "not-a-date".

const dateString = (label) =>
    z
        .string({ error: `${label} is required` })
        .refine(
            (value) => !Number.isNaN(new Date(value).getTime()),
            `Please enter a valid ${label.toLowerCase()}`
        );

// ======================================================
// POST /api/students/add
//
// Note: `password` is NOT accepted here on purpose — the
// controller derives it from dateOfBirth (ddmmyy). Accepting
// a client-supplied password on create would let a caller
// silently override that behaviour.
// ======================================================

const createStudentSchema = z.object({

    grNumber: z
        .string({ error: "GR Number is required" })
        .trim()
        .min(1, "GR Number is required"),

    fullName: z
        .string({ error: "Full name is required" })
        .trim()
        .min(2, "Full name must be at least 2 characters"),

    fatherName: z
        .string({ error: "Father's name is required" })
        .trim()
        .min(2, "Father's name must be at least 2 characters"),

    motherName: z
        .string({ error: "Mother's name is required" })
        .trim()
        .min(2, "Mother's name must be at least 2 characters"),

    gender: genderEnum,

    dateOfBirth: dateString("Date of birth"),

    parentMobile: z
        .string({ error: "Parent mobile number is required" })
        .trim()
        .regex(/^[0-9]{10}$/, "Parent mobile number must be exactly 10 digits"),

    standard: z.coerce
        .number({ error: "Standard is required" })
        .int("Standard must be a whole number")
        .min(1, "Standard must be between 1 and 12")
        .max(12, "Standard must be between 1 and 12"),

    division: z
        .string({ error: "Division is required" })
        .trim()
        .min(1, "Division is required"),

    address: z
        .string({ error: "Address is required" })
        .trim()
        .min(5, "Address must be at least 5 characters"),

    admissionDate: dateString("Admission date").optional(),

    status: statusEnum.optional(),

    photo: z.string().optional()

});

// ======================================================
// PUT /api/students/:id
// Same shape as create, but every field is optional since
// an update may only touch one or two fields.
// ======================================================

const updateStudentSchema = createStudentSchema.partial();

module.exports = {
    createStudentSchema,
    updateStudentSchema
};