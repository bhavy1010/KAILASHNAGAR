const mongoose = require("mongoose");

const subjectResultSchema = new mongoose.Schema({

    subject: {
        type: String,
        required: true
    },

    scheduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExamSchedule",
        default: null
    },

    totalMarks: {
        type: Number,
        required: true
    },

    passingMarks: {
        type: Number,
        required: true
    },

    marksObtained: {
        type: Number,
        required: true
    },

    isPassed: {
        type: Boolean,
        default: false
    },

    grade: {
        type: String,
        default: ""
    },

    remarks: {
        type: String,
        default: ""
    }

});

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

    standard: {
        type: Number,
        required: true
    },

    division: {
        type: String,
        required: true
    },

    academicYearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AcademicYear",
        default: null
    },

    subjectResults: [subjectResultSchema],

    totalMarks: {
        type: Number,
        default: 0
    },

    totalObtained: {
        type: Number,
        default: 0
    },

    percentage: {
        type: Number,
        default: 0
    },

    grade: {
        type: String,
        default: ""
    },

    rank: {
        type: Number,
        default: 0
    },

    isPassed: {
        type: Boolean,
        default: false
    },

    remarks: {
        type: String,
        default: ""
    }

}, {
    timestamps: true
});

// One result per student per exam
resultSchema.index(
    { examId: 1, studentId: 1 },
    { unique: true }
);

// Index for student risk trend analysis
resultSchema.index(
    { studentId: 1, createdAt: -1 }
);

module.exports = mongoose.model("Result", resultSchema);