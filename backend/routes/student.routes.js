const express = require("express");

const authMiddleware = require("../middlewares/auth.middleware");

const roleMiddleware = require("../middlewares/role.middleware");

const validate = require("../middlewares/validate.middleware");

const router = express.Router();

const {

    createStudent,

    getAllStudents,

    getStudentById,

    getStudentByGR,

    searchStudents,

    updateStudent,

    deleteStudent,

    getStudentsPagination

} = require("../controllers/student.controller");

const {
    createStudentSchema,
    updateStudentSchema
} = require("../validators/student.validator");

router.post(

    "/add",

    authMiddleware,

    roleMiddleware("admin", "teacher"),

    validate(createStudentSchema),

    createStudent

);

router.get(

    "/all",

    authMiddleware,

    getAllStudents

);

router.get(

    "/search",

    authMiddleware,

    searchStudents

);

router.get(

    "/pagination",

    authMiddleware,

    getStudentsPagination

);

router.get(

    "/:id",

    authMiddleware,

    getStudentById

);

router.put(

    "/:id",

    authMiddleware,

    roleMiddleware("admin", "teacher"),

    validate(updateStudentSchema),

    updateStudent

);

router.delete(

    "/:id",

    authMiddleware,

    roleMiddleware("admin"),

    deleteStudent

);

router.get(

    "/gr/:grNumber",

    authMiddleware,

    getStudentByGR

);

module.exports = router;