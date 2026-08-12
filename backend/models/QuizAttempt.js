const mongoose = require("mongoose");

const attemptAnswerSchema = new mongoose.Schema({
    questionId: {
        type: String,
        required: true
    },
    questionText: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        required: true
    },
    selectedOption: {
        type: Number,
        default: -1 // -1 means un-attempted / skipped
    },
    correctAnswer: {
        type: Number,
        required: true // Correct option index in the shuffled options
    },
    isCorrect: {
        type: Boolean,
        default: false
    },
    timeSpent: {
        type: Number,
        default: 0
    }
}, { _id: false });

const quizAttemptSchema = new mongoose.Schema({
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    studentPhoto: {
        type: String,
        default: ""
    },
    standard: {
        type: Number,
        required: true
    },
    answers: [attemptAnswerSchema],
    score: {
        type: Number,
        default: 0
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["in_progress", "completed"],
        default: "in_progress"
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    timeTakenSeconds: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
