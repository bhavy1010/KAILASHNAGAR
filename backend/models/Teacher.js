const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({

    fullName: {
        type: String,
        required: true,
        trim: true
    },

    mobile: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        default: null
    },

    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true
    },

    qualification: {
        type: String,
        required: true
    },

    subject: {
        type: String,
        required: true
    },

    joiningDate: {
        type: Date,
        default: Date.now
    },

    address: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Teacher", teacherSchema);