const express =
require("express");

const router =
express.Router();

const {

    createTimetable,

    getClassTimetable

} = require(
    "../controllers/timetable.controller"
);

router.post(
    "/add",
    createTimetable
);

router.get(
    "/class/:classId",
    getClassTimetable
);

module.exports = router;