const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
    createLeave,
    getLeaves,
    updateLeaveStatus
} = require("../controllers/leave.controller");

router.post(

    "/add",

    authMiddleware,

    createLeave

);

router.get(

    "/all",

    authMiddleware,

    getLeaves

);

router.put(

    "/:id/status",

    authMiddleware,

    roleMiddleware("admin", "teacher"),

    updateLeaveStatus

);

module.exports = router;