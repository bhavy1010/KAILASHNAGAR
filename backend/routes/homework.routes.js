const express = require("express");
const authMiddleware =
require(
"../middlewares/auth.middleware"
);

const roleMiddleware =
require(
"../middlewares/role.middleware"
);

const router = express.Router();

const {
    createHomework,
    getAllHomework,
    getHomeworkByClass
} = require("../controllers/homework.controller");

router.post(

    "/add",

    authMiddleware,

    roleMiddleware(
        "admin",
        "teacher"
    ),

    createHomework

);

router.get("/all", getAllHomework);

router.get("/class/:classId", getHomeworkByClass);

module.exports = router;