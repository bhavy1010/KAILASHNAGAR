const express =
require("express");

const router =
express.Router();

const authMiddleware =
require("../middlewares/auth.middleware");

const roleMiddleware =
require("../middlewares/role.middleware");

const {
    getClassAnalytics
} = require(
    "../controllers/analytics.controller"
);

router.get(
    "/class/:classId",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    getClassAnalytics
);

module.exports = router;