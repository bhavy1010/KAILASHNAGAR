// routes/attendance.routes.js

const express =
require("express");

const router =
express.Router();

const {
    markClassAttendance
} = require(
    "../controllers/attendance.controller"
);

router.post(
    "/class",
    markClassAttendance
);

module.exports = router;