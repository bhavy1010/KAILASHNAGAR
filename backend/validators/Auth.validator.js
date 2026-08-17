const { z } = require("zod");

// ======================================================
// POST /api/auth/register-admin
// ======================================================

const registerAdminSchema = z.object({

    name: z
        .string({ error: "Name is required" })
        .trim()
        .min(2, "Name must be at least 2 characters"),

    mobile: z
        .string({ error: "Mobile number is required" })
        .trim()
        .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),

    password: z
        .string({ error: "Password is required" })
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Za-z]/, "Password must contain at least one letter")
        .regex(/[0-9]/, "Password must contain at least one number"),

    secretCode: z
        .string({ error: "Secret code is required" })
        .trim()
        .min(1, "Secret code is required")

});

// ======================================================
// POST /api/auth/login
// Shared by Admin, Teacher and Student — the only
// difference is what "identifier" means for each role
// (mobile number for admin/teacher, GR number for student).
// ======================================================

const loginSchema = z.object({

    identifier: z
        .string({ error: "ID is required" })
        .trim()
        .min(1, "ID is required"),

    password: z
        .string({ error: "Password is required" })
        .min(1, "Password is required"),

    role: z.enum(["admin", "teacher", "student"], {
        error: "Role must be admin, teacher or student"
    })

});

// ======================================================
// POST /api/auth/reset-admin-password
// ======================================================

const resetAdminPasswordSchema = z.object({

    mobile: z
        .string({ error: "Mobile number is required" })
        .trim()
        .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),

    secretCode: z
        .string({ error: "Secret code is required" })
        .trim()
        .min(1, "Secret code is required"),

    newPassword: z
        .string({ error: "New password is required" })
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Za-z]/, "Password must contain at least one letter")
        .regex(/[0-9]/, "Password must contain at least one number")

});

// ======================================================
// POST /api/auth/reset-teacher-password
//
// secretCode must be a 6-digit numeric code (TEACHER_RESET_CODE),
// and is explicitly rejected if it matches the admin's secret
// code — even if a school accidentally sets the two env vars
// to the same value, this endpoint will still refuse to treat
// them as interchangeable.
// ======================================================

const resetTeacherPasswordSchema = z.object({

    mobile: z
        .string({ error: "Mobile number is required" })
        .trim()
        .regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),

    secretCode: z
        .string({ error: "Secret code is required" })
        .trim()
        .regex(/^[0-9]{6}$/, "Secret code must be exactly 6 digits")
        .refine(
            (code) => code !== process.env.ADMIN_SIGNUP_CODE,
            "This code is not valid for a teacher password reset"
        ),

    newPassword: z
        .string({ error: "New password is required" })
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Za-z]/, "Password must contain at least one letter")
        .regex(/[0-9]/, "Password must contain at least one number")

});

module.exports = {
    registerAdminSchema,
    loginSchema,
    resetAdminPasswordSchema,
    resetTeacherPasswordSchema
};