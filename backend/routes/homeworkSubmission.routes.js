const express =
require("express");

const router =
express.Router();

const {

    submitHomework,

    getHomeworkCompletion

} = require(

"../controllers/homeworkSubmission.controller"

);

router.post(
    "/submit",
    submitHomework
);

router.get(
    "/completion/:homeworkId",
    getHomeworkCompletion
);

module.exports = router;