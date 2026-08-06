// ======================================================
// Generic Request Validation Middleware
//
// Wraps a Zod schema so any route can validate + sanitize
// its request body in one line:
//
//   router.post("/add", validate(createStudentSchema), createStudent);
//
// On failure: responds 400 with a clean, consistent error
// shape (never a raw Mongoose/driver error, never a 500 for
// something the client controls).
//
// On success: req.body is REPLACED with the parsed/coerced
// data. This means the controller can trust the types coming
// out the other side (e.g. `standard` is already a Number,
// `fullName` is already trimmed) instead of re-doing that
// work by hand in every controller.
// ======================================================

const validate = (schema) => (req, res, next) => {

    const result = schema.safeParse(req.body);

    if (!result.success) {

        const errors = result.error.issues.map((issue) => ({
            field: issue.path.join(".") || "body",
            message: issue.message
        }));

        return res.status(400).json({

            success: false,

            // First error as the headline message so existing
            // frontend code that just shows error.response.data.message
            // keeps working without any changes.
            message: errors[0]?.message || "Invalid input",

            errors

        });

    }

    req.body = result.data;

    next();

};

module.exports = validate;