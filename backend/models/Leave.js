const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({

    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true
    },

    leaveType: {
        type: String,
        enum: [
            "Sick Leave",
            "Casual Leave",
            "Emergency Leave",
            "Other"
        ],
        required: true
    },

    fromDate: {
        type: Date,
        required: true
    },

    toDate: {
        type: Date,
        required: true
    },

    reason: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: [
            "Pending",
            "Approved",
            "Rejected"
        ],
        default: "Pending"
    },

    adminRemark: {
        type: String,
        default: ""
    }

}, {
    timestamps: true
});

module.exports = mongoose.models.Leave || mongoose.model("Leave", leaveSchema);