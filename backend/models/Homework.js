const mongoose = require("mongoose");

const homeworkSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    subject: {
        type: String,
        required: true
    },

    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true
    },

    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true
    },

    dueDate: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: ["Active", "Closed"],
        default: "Active"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "Homework",
    homeworkSchema
);