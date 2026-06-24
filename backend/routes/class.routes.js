const express =
require("express");

const router =
express.Router();

const {

    createClass,

    getAllClasses

} = require(
    "../controllers/class.controller"
);

router.post(
    "/add",
    createClass
);

router.get(
    "/all",
    getAllClasses
);

module.exports = router;