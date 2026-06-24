const express = require("express");

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

router.post("/add", createTeacher);

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
    deleteTeacher
);

module.exports = router;