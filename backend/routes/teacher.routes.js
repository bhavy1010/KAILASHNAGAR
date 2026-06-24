const express = require("express");

const authMiddleware =
require(
"../middlewares/auth.middleware"
);

const roleMiddleware =
require(
"../middlewares/role.middleware"
);

const router = express.Router();

const {
    createTeacher,
    getAllTeachers,
    getTeacherByMobile,
    searchTeachers,
    getTeachersPagination,
    updateTeacher,
    deleteTeacher
} = require("../controllers/teacher.controller");

router.post(

    "/add",

    authMiddleware,

    roleMiddleware(
        "admin"
    ),

    createTeacher

);

router.get("/all", getAllTeachers);

router.get("/:mobile", getTeacherByMobile);

router.get(
    "/search",
    searchTeachers
);

router.get(
    "/pagination",
    getTeachersPagination
);

router.put(
    "/:id",
    updateTeacher
);

router.delete(

    "/:id",

    authMiddleware,

    roleMiddleware(
        "admin"
    ),

    deleteTeacher

);
module.exports = router;