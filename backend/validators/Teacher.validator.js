const { z } = require("zod");

const genderEnum = z.enum(["Male", "Female", "Other"], {
    error: "Gender must be Male, Female or Other"
});

const statusEnum = z.enum(["Active", "Inactive"], {
    error: "Status must be Active or Inactive"
});

// ======================================================
// POST /api/teachers/add
//
// `password` is intentionally optional here — the controller
// falls back to the mobile number as the password when it's
// left blank, matching existing behaviour.
// ======================================================

const createTeacherSchema = z.object({

    fullName: z
        .string({ error: "Full name is required" })
        .trim()
        .min(2, "Full name must be at least 2 characters"),

    mobile: z
        .string({ error: "Mobile number is required" })
        .trim()
        .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),

    email: z
        .string()
        .trim()
        .email("Please enter a valid email address")
        .optional()
        .or(z.literal("")),

    password: z
        .string()
        .trim()
        .min(6, "Password must be at least 6 characters")
        .optional()
        .or(z.literal("")),

    gender: genderEnum,

    qualification: z
        .string({ error: "Qualification is required" })
        .trim()
        .min(2, "Qualification is required"),

    subject: z
        .string({ error: "Subject is required" })
        .trim()
        .min(1, "Subject is required"),

    experience: z.coerce
        .number()
        .min(0, "Experience cannot be negative")
        .optional(),

    salary: z.coerce
        .number()
        .min(0, "Salary cannot be negative")
        .optional(),

    subjectsHandled: z.array(z.string()).optional(),

    classesHandled: z.array(z.string()).optional(),

    joiningDate: z
        .string()
        .refine(
            (value) => !Number.isNaN(new Date(value).getTime()),
            "Please enter a valid joining date"
        )
        .optional(),

    address: z
        .string({ error: "Address is required" })
        .trim()
        .min(5, "Address must be at least 5 characters"),

    status: statusEnum.optional(),

    photo: z.string().optional()

});

// ======================================================
// PUT /api/teachers/:id
// ======================================================

const updateTeacherSchema = createTeacherSchema.partial();

module.exports = {
    createTeacherSchema,
    updateTeacherSchema
};