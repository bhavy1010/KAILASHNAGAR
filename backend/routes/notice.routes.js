const express =
require("express");

const router =
express.Router();

const {

    createNotice,

    getAllNotices

} = require(
    "../controllers/notice.controller"
);

router.post(
    "/add",
    createNotice
);

router.get(
    "/all",
    getAllNotices
);

module.exports = router;