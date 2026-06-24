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

    createStudent,

    getAllStudents,

    getStudentByGR,

    searchStudents,

    updateStudent,

    deleteStudent,

    getStudentsPagination

} = require(
    "../controllers/student.controller"
);
router.post(

    "/add",

    authMiddleware,

    roleMiddleware(
        "admin"
    ),

    createStudent

);

router.get("/all", getAllStudents);

router.get("/search", searchStudents);

router.get("/pagination", getStudentsPagination);

router.get("/:grNumber", getStudentByGR);

router.put("/:id", updateStudent);

router.delete("/:id", deleteStudent);

module.exports = router;