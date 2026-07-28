const mongoose = require("mongoose");

const todayRoseSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },

        studentName: {
            type: String,
            required: true,
            trim: true
        },

        grNumber: {
            type: String,
            required: true,
            trim: true
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

        title: {
            type: String,
            default: "Today's Rose",
            trim: true
        },

        reason: {
            type: String,
            required: true,
            trim: true
        },

        photo: {
            type: String,
            default: ""
        },

        awardDate: {
            type: Date,
            required: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);

// A student can only receive one "Today's Rose" per calendar day,
// but multiple different students can each receive one on the same day.
todayRoseSchema.index({ studentId: 1, awardDate: 1 }, { unique: true });

module.exports = mongoose.model("TodayRose", todayRoseSchema);