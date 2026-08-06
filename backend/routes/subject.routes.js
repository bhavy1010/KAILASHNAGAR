const express =
require("express");

const router =
express.Router();

const authMiddleware =
require("../middlewares/auth.middleware");

const roleMiddleware =
require("../middlewares/role.middleware");

const validate =
require("../middlewares/validate.middleware");

const {

    createSubject,

    getAllSubjects,

    getSubjectById,

    updateSubject,

    deleteSubject

} = require(
    "../controllers/subject.controller"
);

const {
    createSubjectSchema,
    updateSubjectSchema
} = require("../validators/subject.validator");

router.post(
    "/add",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    validate(createSubjectSchema),
    createSubject
);

router.get(
    "/all",
    authMiddleware,
    getAllSubjects
);

router.get(
    "/:id",
    authMiddleware,
    getSubjectById
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    validate(updateSubjectSchema),
    updateSubject
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    deleteSubject
);

module.exports =
router;