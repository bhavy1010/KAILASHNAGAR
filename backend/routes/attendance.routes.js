const express =
require("express");

const router =
express.Router();

const authMiddleware =
require(
"../middlewares/auth.middleware"
);

const roleMiddleware =
require(
"../middlewares/role.middleware"
);

const {
    markClassAttendance
} = require(
    "../controllers/attendance.controller"
);

router.post(

    "/class",

    authMiddleware,

    roleMiddleware(
        "admin",
        "teacher"
    ),

    markClassAttendance

);

module.exports = router;