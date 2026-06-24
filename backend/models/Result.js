const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({

    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
        required: true
    },

    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
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

    marksObtained: {
        type: Number,
        required: true
    },

    remarks: {
        type: String,
        default: ""
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "Result",
    resultSchema
);