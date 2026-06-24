const express =
require("express");

const router =
express.Router();

const {

    createSubject,

    getAllSubjects,

    getSubjectById,

    updateSubject,

    deleteSubject

} = require(
    "../controllers/subject.controller"
);

router.post(
    "/add",
    createSubject
);

router.get(
    "/all",
    getAllSubjects
);

router.get(
    "/:id",
    getSubjectById
);

router.put(
    "/:id",
    updateSubject
);

router.delete(
    "/:id",
    deleteSubject
);

module.exports =
router;