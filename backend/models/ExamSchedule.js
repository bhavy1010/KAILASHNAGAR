const mongoose = require("mongoose");

const examScheduleSchema = new mongoose.Schema({

    examId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Exam",
        required: true
    },

    subject: {
        type: String,
        required: true,
        trim: true
    },

    examDate: {
        type: Date,
        required: true
    },

    startTime: {
        type: String,
        required: true
    },

    endTime: {
        type: String,
        required: true
    },

    totalMarks: {
        type: Number,
        required: true
    },

    passingMarks: {
        type: Number,
        required: true
    },

    roomNumber: {
        type: String,
        default: ""
    },

    notes: {
        type: String,
        default: ""
    }

}, {
    timestamps: true
});

examScheduleSchema.index({ examId: 1, subject: 1 });

module.exports = mongoose.model("ExamSchedule", examScheduleSchema);