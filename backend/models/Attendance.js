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
                enum: ["Present", "Absent"],
                required: true
            }

        }

    ]

}, {
    timestamps: true
});

module.exports =
mongoose.model(
    "Attendance",
    attendanceSchema
);