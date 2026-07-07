const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const { uploadHomework } = require("../middlewares/upload.middleware");

const {

    createHomework,
    getAllHomework,
    getHomeworkById,
    getHomeworkByClass,
    getHomeworkForStudent,
    updateHomework,
    deleteHomework,
    getHomeworkDashboard

} = require("../controllers/homework.controller");

// Dashboard — specific routes before dynamic :id
router.get(
    "/dashboard",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    getHomeworkDashboard
);

router.get(
    "/all",
    authMiddleware,
    getAllHomework
);

router.get(
    "/class/:classId",
    authMiddleware,
    getHomeworkByClass
);

router.get(
    "/student/:studentId",
    authMiddleware,
    getHomeworkForStudent
);

router.post(
    "/add",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    uploadHomework.single("attachment"),
    createHomework
);

router.get(
    "/:id",
    authMiddleware,
    getHomeworkById
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    uploadHomework.single("attachment"),
    updateHomework
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    deleteHomework
);

module.exports = router;