const express =
require("express");

const router =
express.Router();

const {

    createAcademicYear,

    getAllAcademicYears,

    setActiveYear

} = require(
"../controllers/academicYear.controller"
);

router.post(
    "/add",
    createAcademicYear
);

router.get(
    "/all",
    getAllAcademicYears
);

router.put(
    "/active/:id",
    setActiveYear
);

module.exports =
router;