const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        photo: {
            type: String,
            default: ""
        },

        achievementDate: {
            type: Date,
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

module.exports = mongoose.model(
    "Achievement",
    achievementSchema
);