const express =
require("express");

const router =
express.Router();

const {
    promoteStudents
} = require(
    "../controllers/promotion.controller"
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

    "/promote",

    authMiddleware,

    roleMiddleware(
        "admin"
    ),

    promoteStudents

);

module.exports =
router;