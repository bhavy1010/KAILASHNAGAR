const express =
require("express");

const router =
express.Router();

const {

    applyLeave,

    getAllLeaves,

    updateLeaveStatus,

    getTeacherLeaves

} = require(
    "../controllers/leave.controller"
);

const authMiddleware =
require(
    "../middlewares/auth.middleware"
);

const roleMiddleware =
require(
    "../middlewares/role.middleware"
);

router.post(

    "/apply",

    authMiddleware,

    roleMiddleware(
        "teacher"
    ),

    applyLeave

);

router.get(

    "/all",

    authMiddleware,

    roleMiddleware(
        "admin"
    ),

    getAllLeaves

);

router.put(

    "/status/:id",

    authMiddleware,

    roleMiddleware(
        "admin"
    ),

    updateLeaveStatus

);

router.get(

    "/teacher/:teacherId",

    authMiddleware,

    getTeacherLeaves

);

module.exports =
router;