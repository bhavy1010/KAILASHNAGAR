const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const { uploadSubmission } = require("../middlewares/upload.middleware");

const {
    submitHomeworkSchema,
    gradeSubmissionSchema
} = require("../validators/homeworkSubmission.validator");

const {

    submitHomework,
    getSubmissionsByHomework,
    getMySubmissions,
    getSubmissionById,
    gradeSubmission,
    getHomeworkCompletion

} = require("../controllers/homeworkSubmission.controller");

// Specific routes first
router.get(
    "/homework/:homeworkId",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    getSubmissionsByHomework
);

router.get(
    "/student/:studentId",
    authMiddleware,
    getMySubmissions
);

router.get(
    "/completion/:homeworkId",
    authMiddleware,
    getHomeworkCompletion
);

router.post(
    "/submit",
    authMiddleware,
    roleMiddleware("student"),
    uploadSubmission.single("fileAttachment"),
    validate(submitHomeworkSchema),
    submitHomework
);

router.put(
    "/:id/grade",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    validate(gradeSubmissionSchema),
    gradeSubmission
);

router.get(
    "/:id",
    authMiddleware,
    getSubmissionById
);

module.exports = router;