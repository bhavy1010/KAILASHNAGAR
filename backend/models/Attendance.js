// models/Attendance.js

const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({

    attendanceDate: {
        type: Date,
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

    records: [

        {

            studentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Student",
                required: true
            },

            grNumber: {
                type: String,
                required: true
            },

            fullName: {
                type: String,
                required: true
            },

            status: {
                type: String,
                enum: ["Present", "Absent", "Late", "Leave"],
                required: true
            },

            remarks: {
                type: String,
                default: ""
            },

            markedAt: {
                type: Date,
                default: Date.now
            }

        }

    ],

    academicYearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AcademicYear",
        required: true
    },

    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    markedByRole: {
        type: String,
        enum: ["admin", "teacher"],
        required: true
    }

}, {
    timestamps: true
});

// One attendance document per class+division+date

attendanceSchema.index(
    { standard: 1, division: 1, attendanceDate: 1 },
    { unique: true }
);

module.exports =
mongoose.model(
    "Attendance",
    attendanceSchema
);