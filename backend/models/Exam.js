const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({

    examName: {
        type: String,
        required: true,
        trim: true
    },

    examType: {
        type: String,
        enum: ["Unit Test", "Mid Term", "Final", "Weekly Test", "Mock Test", "Other"],
        required: true
    },

    standard: {
        type: Number,
        required: true
    },

    division: {
        type: String,
        required: true,
        trim: true
    },

    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        default: null
    },

    academicYearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AcademicYear",
        default: null
    },

    startDate: {
        type: Date,
        required: true
    },

    endDate: {
        type: Date,
        required: true
    },

    description: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        enum: ["Upcoming", "Ongoing", "Completed"],
        default: "Upcoming"
    },

    totalMarks: {
        type: Number,
        default: 0
    },

    passingMarks: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});

examSchema.index({ standard: 1, division: 1, status: 1 });

module.exports = mongoose.model("Exam", examSchema);