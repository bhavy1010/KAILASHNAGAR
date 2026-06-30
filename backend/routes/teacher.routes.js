const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

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

router.post(

    "/add",

    authMiddleware,

    roleMiddleware("admin"),

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

    updateTeacher

);

router.delete(

    "/:id",

    authMiddleware,

    roleMiddleware("admin"),

    deleteTeacher

);

module.exports = router;