const mongoose = require("mongoose");

const homeworkSubmissionSchema = new mongoose.Schema({

    homeworkId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Homework",
        required: true
    },

    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },

    // Written answer (optional)
    answer: {
        type: String,
        default: ""
    },

    // Uploaded file answer
    fileAttachment: {
        type: String,
        default: ""
    },

    fileOriginalName: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        enum: ["Pending", "Submitted", "Graded", "Late"],
        default: "Pending"
    },

    submittedAt: {
        type: Date
    },

    // Grading
    grade: {
        type: Number,
        default: null
    },

    feedback: {
        type: String,
        default: ""
    },

    gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },

    gradedAt: {
        type: Date,
        default: null
    }

}, {
    timestamps: true
});

// One submission per student per homework
homeworkSubmissionSchema.index(

    { homeworkId: 1, studentId: 1 },

    { unique: true }

);

module.exports = mongoose.model(
    "HomeworkSubmission",
    homeworkSubmissionSchema
);