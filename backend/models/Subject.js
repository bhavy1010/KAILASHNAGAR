const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
    {
        subjectName: {
            type: String,
            required: true,
            trim: true
        },

        subjectCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true
        },

        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Teacher",
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports =
    mongoose.models.Subject ||
    mongoose.model("Subject", subjectSchema);