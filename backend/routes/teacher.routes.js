const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");

const router = express.Router();

const {
    createTeacher,
    getAllTeachers,
    getTeacherById,
    getTeacherByMobile,
    searchTeachers,
    getTeachersPagination,
    updateTeacher,
    deleteTeacher
} = require("../controllers/teacher.controller");

const {
    createTeacherSchema,
    updateTeacherSchema
} = require("../validators/teacher.validator");

// GET /api/teachers/me/scope — returns the logged-in teacher's assigned
// subjects and classes so the frontend can filter dropdowns accordingly.
router.get("/me/scope", authMiddleware, async (req, res) => {
    try {
        const Teacher = require("../models/Teacher");
        const teacher = await Teacher.findById(req.user.id).select(
            "subject subjectsHandled classesHandled"
        );

        if (!teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found." });
        }

        const allSubjects = [
            ...new Set(
                [teacher.subject, ...(teacher.subjectsHandled || [])].filter(Boolean)
            )
        ];

        res.json({
            success: true,
            subjectsHandled: allSubjects,
            classesHandled: teacher.classesHandled || []
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post(

    "/add",

    authMiddleware,

    roleMiddleware("admin"),

    validate(createTeacherSchema),

    createTeacher

);


router.get(
    "/all",
    authMiddleware,
    getAllTeachers
);

router.get(
    "/search",
    authMiddleware,
    searchTeachers
);

router.get(
    "/pagination",
    authMiddleware,
    getTeachersPagination
);

router.get(
    "/mobile/:mobile",
    authMiddleware,
    getTeacherByMobile
);

router.get(
    "/:id",
    authMiddleware,
    getTeacherById
);

router.put(

    "/:id",

    authMiddleware,

    roleMiddleware("admin"),

    validate(updateTeacherSchema),

    updateTeacher

);

router.delete(

    "/:id",

    authMiddleware,

    roleMiddleware("admin"),

    deleteTeacher

);

module.exports = router;