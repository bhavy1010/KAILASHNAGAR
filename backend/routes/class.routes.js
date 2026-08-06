const express =
require("express");

const router =
express.Router();

const authMiddleware =
require("../middlewares/auth.middleware");

const roleMiddleware =
require("../middlewares/role.middleware");

const validate =
require("../middlewares/validate.middleware");

const {

    createClass,

    getAllClasses

} = require(
    "../controllers/class.controller"
);

const {
    createClassSchema
} = require("../validators/class.validator");

router.post(
    "/add",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    validate(createClassSchema),
    createClass
);

router.get(
    "/all",
    authMiddleware,
    getAllClasses
);

module.exports = router;