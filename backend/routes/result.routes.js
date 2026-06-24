const express =
require("express");

const router =
express.Router();

const {

    addResult,

    getStudentResults,

    generateReportCard

} = require(
    "../controllers/result.controller"
);

router.post(
    "/add",
    addResult
);

router.get(
    "/student/:studentId",
    getStudentResults
);

router.get(
    "/report-card/:studentId",
    generateReportCard
);

module.exports = router;