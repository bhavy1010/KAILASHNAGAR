const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({

    standard: {
        type: Number,
        required: true
    },

    division: {
        type: String,
        required: true
    },

    className: {
        type: String,
        required: true,
        unique: true
    },

    classTeacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher"
    },

    roomNumber: {
        type: String
    },

    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "Class",
    classSchema
);