const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({

    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
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
        required: true,
        trim: true
    },

    // Optional supporting document — e.g. a medical certificate for
    // sick leave. Stores just the filename; the actual file lives on
    // disk under uploads/leaves/ (see upload.middleware.js).
    attachment: {
        type: String,
        default: ""
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

    // Who reviewed the request (teacher or admin)

    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },

    reviewedByRole: {
        type: String,
        enum: ["teacher", "admin", null],
        default: null
    },

    reviewedByName: {
        type: String,
        default: ""
    },

    reviewedAt: {
        type: Date,
        default: null
    },

    // Remark left by the teacher/admin while approving or rejecting

    remark: {
        type: String,
        default: ""
    },

    // Set to true whenever the status changes, so the student can be shown
    // a "new response" indicator. Cleared once the student views it.

    seenByStudent: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.models.Leave || mongoose.model("Leave", leaveSchema);