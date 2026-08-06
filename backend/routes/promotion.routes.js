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

const validate =
require(
    "../middlewares/validate.middleware"
);

const {
    promoteStudentsSchema
} = require(
    "../validators/promotion.validator"
);

router.post(

    "/promote",

    authMiddleware,

    roleMiddleware(
        "admin"
    ),

    validate(promoteStudentsSchema),

    promoteStudents

);

module.exports =
router;