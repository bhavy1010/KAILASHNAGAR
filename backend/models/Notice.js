const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({

    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true
    },

    reason: {
        type: String,
        required: true,
        trim: true
    },

    fromDate: {
        type: Date,
        required: true
    },

    toDate: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending"
    },

    appliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },

    remarks: {
        type: String,
        default: ""
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Leave", leaveSchema);