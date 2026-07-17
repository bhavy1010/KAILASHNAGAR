const mongoose = require("mongoose");

const schoolInfoSchema = new mongoose.Schema(
    {
        schoolName: {
            type: String,
            default: "KailashNagar School",
            trim: true
        },

        tagline: {
            type: String,
            default: "Learn • Grow • Achieve",
            trim: true
        },

        about: {
            type: String,
            default: "",
            trim: true
        },

        phone: {
            type: String,
            default: "",
            trim: true
        },

        email: {
            type: String,
            default: "",
            trim: true,
            lowercase: true
        },

        address: {
            type: String,
            default: "",
            trim: true
        },

        mapLink: {
            type: String,
            default: "",
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "SchoolInfo",
    schoolInfoSchema
);