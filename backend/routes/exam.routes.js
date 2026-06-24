const express =
require("express");

const router =
express.Router();

const {

    createExam,

    getAllExams

} = require(
    "../controllers/exam.controller"
);

router.post(
    "/add",
    createExam
);

router.get(
    "/all",
    getAllExams
);

module.exports = router;