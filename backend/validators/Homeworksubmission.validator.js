const { z } = require("zod");
const { objectId } = require("./common.validator");

// ======================================================
// POST /api/homework-submission/submit
// Runs through multer (uploadHomeworkSubmission.single)
// before this, so req.body only has the text fields —
// the file itself is handled via req.file in the controller.
// ======================================================

const submitHomeworkSchema = z.object({

    homeworkId: objectId("Homework ID"),

    studentId: objectId("Student ID"),

    answer: z.string().optional()

});

// ======================================================
// PUT /api/homework-submission/:id/grade
// ======================================================

const gradeSubmissionSchema = z.object({

    grade: z.coerce
        .number({ error: "Grade is required" })
        .min(0, "Grade cannot be negative"),

    feedback: z.string().optional()

});

module.exports = {
    submitHomeworkSchema,
    gradeSubmissionSchema
};