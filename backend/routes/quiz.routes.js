const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");
const quizController = require("../controllers/quiz.controller");

// All quiz endpoints require user authentication
router.use(authMiddleware);

// Admin & Teacher endpoints
router.post(
    "/manual",
    roleMiddleware("admin", "teacher"),
    quizController.createManualQuiz
);

router.post(
    "/auto",
    roleMiddleware("admin", "teacher"),
    quizController.createAutoQuiz
);

router.put(
    "/:id/status",
    roleMiddleware("admin", "teacher"),
    quizController.togglePublishStatus
);

router.put(
    "/:id",
    roleMiddleware("admin", "teacher"),
    quizController.updateQuiz
);

router.delete(
    "/:id",
    roleMiddleware("admin", "teacher"),
    quizController.deleteQuiz
);

router.get(
    "/analytics",
    roleMiddleware("admin", "teacher"),
    quizController.getQuizAnalytics
);

// General & Student endpoints
router.get("/", quizController.getQuizzes);
router.get("/results/my", quizController.getStudentAttempts);
router.get("/attempt/detail/:attemptId", quizController.getAttemptById);
router.get("/:quizId/rank", quizController.getQuizLeaderboard);
router.get("/:id", quizController.getQuizById);

// Student Quiz Attempt execution endpoints
router.post("/:id/start", roleMiddleware("student"), quizController.startQuiz);
router.put("/attempt/:attemptId/save-answer", roleMiddleware("student"), quizController.saveAnswer);
router.post("/attempt/:attemptId/submit", roleMiddleware("student"), quizController.submitQuiz);

module.exports = router;
