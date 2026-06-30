const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    noticeFor: {
        type: String,
        enum: [
            "All",
            "Teachers",
            "Students"
        ],
        default: "All"
    },

    publishedBy: {
        type: String,
        default: "Admin"
    },
    image: {
        type: String
    },

}, {
    timestamps: true
});

module.exports =
mongoose.model(
    "Notice",
    noticeSchema
);