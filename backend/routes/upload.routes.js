const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
    upload,
    uploadTeacher,
    uploadAdmin,
    verifyUploadedFile
} = require("../middlewares/upload.middleware");

const {
    uploadStudentPhoto,
    uploadTeacherPhoto,
    uploadAdminPhoto
} = require("../controllers/upload.controller");

// ======================================================
// Upload Student Photo
// POST : /api/upload/student-photo/:id
// ======================================================

router.post(

    "/student-photo/:id",

    authMiddleware,

    roleMiddleware("admin", "teacher", "student"),

    upload.single("photo"),

    verifyUploadedFile,

    uploadStudentPhoto

);

// ======================================================
// Upload Teacher Photo
// POST : /api/upload/teacher-photo/:id
// ======================================================

router.post(

    "/teacher-photo/:id",

    authMiddleware,

    roleMiddleware("admin", "teacher"),

    uploadTeacher.single("photo"),

    verifyUploadedFile,

    uploadTeacherPhoto

);

// ======================================================
// Upload Admin Photo
// POST : /api/upload/admin-photo/:id
// ======================================================

router.post(

    "/admin-photo/:id",

    authMiddleware,

    roleMiddleware("admin"),

    uploadAdmin.single("photo"),

    verifyUploadedFile,

    uploadAdminPhoto

);

module.exports = router;