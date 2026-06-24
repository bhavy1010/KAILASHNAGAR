const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({

    examName: {
        type: String,
        required: true
    },

    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true
    },

    subject: {
        type: String,
        required: true
    },

    totalMarks: {
        type: Number,
        required: true
    },

    examDate: {
        type: Date,
        required: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "Exam",
    examSchema
);