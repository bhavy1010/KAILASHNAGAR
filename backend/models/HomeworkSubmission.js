const mongoose = require("mongoose");

const homeworkSubmissionSchema =
new mongoose.Schema({

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

    status: {
        type: String,
        enum: [
            "Submitted",
            "Pending"
        ],
        default: "Pending"
    },

    submittedAt: {
        type: Date
    }

}, {
    timestamps: true
});

module.exports =
mongoose.model(
    "HomeworkSubmission",
    homeworkSubmissionSchema
);