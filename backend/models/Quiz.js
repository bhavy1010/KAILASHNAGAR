const mongoose = require("mongoose");

const quizQuestionSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    chapter: {
        type: Number,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    options: {
        type: [String],
        required: true,
        validate: [
            (val) => val.length >= 2 && val.length <= 4,
            "Options must be between 2 and 4"
        ]
    },
    correctAnswer: {
        type: Number,
        required: true
    }
}, { _id: false });

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    quizType: {
        type: String,
        enum: ["manual", "auto"],
        required: true
    },
    standard: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    chapters: {
        type: [Number],
        required: true
    },
    questionCount: {
        type: Number,
        required: true,
        min: 1
    },
    timeLimitPerQuestion: {
        type: Number,
        default: 0 // 0 means no time limit, or seconds (15, 30, 45, 60, 90, 120, 180)
    },
    showAnswerReview: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ["draft", "published"],
        default: "draft"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdByName: {
        type: String,
        default: "Teacher/Admin"
    },
    questions: [quizQuestionSchema],
    autoQuestionIds: [String]
}, {
    timestamps: true
});

module.exports = mongoose.model("Quiz", quizSchema);
