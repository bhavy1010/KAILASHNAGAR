const mongoose = require("mongoose");

const schoolInfoSchema = new mongoose.Schema(
    {
        schoolName: {
            type: String,
            default: "",
            trim: true
        },

        tagline: {
            type: String,
            default: "",
            trim: true
        },

        about: {
            type: String,
            default: "",
            trim: true
        },

        logo: {
            type: String,
            default: ""
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

module.exports = mongoose.model("SchoolInfo", schoolInfoSchema);