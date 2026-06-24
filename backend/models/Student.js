const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({

    grNumber: {
        type: String,
        required: true,
        unique: true
    },

    fullName: {
        type: String,
        required: true
    },

    fatherName: {
        type: String,
        required: true
    },

    motherName: {
        type: String,
        required: true
    },

    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true
    },

    dateOfBirth: {
        type: Date,
        required: true
    },

    parentMobile: {
        type: String,
        required: true
    },

    standard: {
        type: Number,
        required: true
    },

    division: {
        type: String,
        required: true
    },

    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true
    },

    address: {
        type: String,
        required: true
    },

    admissionDate: {
        type: Date,
        default: Date.now
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
    "Student",
    studentSchema
);