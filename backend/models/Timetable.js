const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({

    classId: {
        type: String,
        required: true
    },

    entries: [{
        day: { type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        type: { type: String, enum: ["class", "break"], default: "class" },
        subject: { type: String, trim: true },
        teacherName: { type: String, trim: true },
        label: { type: String, trim: true },
        color: { type: String, default: "indigo" }
    }]

}, {
    timestamps: true
});

timetableSchema.index({ classId: 1 }, { unique: true });

module.exports =
mongoose.model(
    "Timetable",
    timetableSchema
);
