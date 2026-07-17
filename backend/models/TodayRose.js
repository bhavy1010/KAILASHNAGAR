const mongoose = require("mongoose");

const todayRoseSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true
        },

        title: {
            type: String,
            default: "Today's Rose"
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
            required: true,
            default: Date.now
        },

        isPublished: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

todayRoseSchema.index(
    { awardDate: 1 },
    { unique: true }
);

module.exports = mongoose.model(
    "TodayRose",
    todayRoseSchema
);