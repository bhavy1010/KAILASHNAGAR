const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({

    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true
    },

    day: {
        type: String,
        enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ],
        required: true
    },

    periods: [

        {
            periodNumber: Number,

            startTime: String,

            endTime: String,

            subject: String,

            teacherName: String
        }

    ]

}, {
    timestamps: true
});

module.exports =
mongoose.model(
    "Timetable",
    timetableSchema
);