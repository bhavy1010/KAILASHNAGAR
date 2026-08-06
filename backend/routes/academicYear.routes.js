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

    createAcademicYear,

    getAllAcademicYears,

    setActiveYear

} = require(
"../controllers/academicYear.controller"
);

const {
    createAcademicYearSchema
} = require("../validators/academicYear.validator");

router.post(
    "/add",
    authMiddleware,
    roleMiddleware("admin"),
    validate(createAcademicYearSchema),
    createAcademicYear
);

router.get(
    "/all",
    authMiddleware,
    getAllAcademicYears
);

router.put(
    "/active/:id",
    authMiddleware,
    roleMiddleware("admin"),
    setActiveYear
);

module.exports =
router;