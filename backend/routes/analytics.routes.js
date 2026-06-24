const express =
require("express");

const router =
express.Router();

const {
    getClassAnalytics
} = require(
    "../controllers/analytics.controller"
);

router.get(
    "/class/:classId",
    getClassAnalytics
);

module.exports = router;