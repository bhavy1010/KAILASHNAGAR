const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const validate = require("../middlewares/validate.middleware");
const { uploadLeave } = require("../middlewares/upload.middleware");

const {
    createLeave,
    getLeaves,
    updateLeaveStatus
} = require("../controllers/leave.controller");

const { createLeaveSchema } = require("../validators/leave.validator");

router.post(

    "/add",

    authMiddleware,

    roleMiddleware("student"),

    uploadLeave.single("attachment"),

    validate(createLeaveSchema),

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