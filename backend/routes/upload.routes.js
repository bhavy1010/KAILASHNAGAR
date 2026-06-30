const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const upload = require("../middlewares/upload.middleware");
// (keep your existing require lines for express, auth, role, upload as-is)
const { uploadTeacher } = require("../middlewares/upload.middleware");


// const {
//     uploadStudentPhoto
// } = require("../controllers/upload.controller");


const {
    uploadStudentPhoto,
    uploadTeacherPhoto
} = require("../controllers/upload.controller");


// ======================================================
// Upload Student Photo
// POST : /api/upload/student-photo/:id
// ======================================================

router.post(

    "/student-photo/:id",

    authMiddleware,

    roleMiddleware("admin", "teacher"),

    upload.single("photo"),

    uploadStudentPhoto

);


// ======================================================
// Upload Teacher Photo
// POST : /api/upload/teacher-photo/:id
// ======================================================

router.post(

    "/teacher-photo/:id",

    authMiddleware,

    roleMiddleware("admin"),

    uploadTeacher.single("photo"),

    uploadTeacherPhoto

);

module.exports = router;