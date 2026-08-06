const mongoose = require("mongoose");

// ======================================================
// Notification
//
// One document per (recipient, event) — e.g. a notice sent
// to 200 students creates 200 documents. This keeps reads
// dead simple (one query per user, indexed) at the cost of
// some write duplication, which is the right tradeoff for a
// school app's traffic pattern (far more reads than writes).
// ======================================================

const notificationSchema = new mongoose.Schema({

    // Who this notification is for. Stored alongside the role
    // because the same ObjectId space isn't shared between the
    // Student/Teacher/User collections.
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },

    userRole: {
        type: String,
        enum: ["admin", "teacher", "student"],
        required: true
    },

    title: {
        type: String,
        required: true,
        trim: true
    },

    message: {
        type: String,
        required: true,
        trim: true
    },

    // What kind of event this is — lets the frontend pick an
    // icon/color without string-matching the title.
    type: {
        type: String,
        enum: [
            "leave",
            "homework",
            "exam",
            "notice",
            "result",
            "attendance",
            "general"
        ],
        default: "general"
    },

    // Where clicking the notification should take the user,
    // e.g. "/attendance/leaves" or "/homework/123".
    link: {
        type: String,
        default: ""
    },

    read: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

// Every read of this collection is "give me this user's
// notifications, newest first" or "how many are unread" —
// this index covers both.
notificationSchema.index({ userId: 1, userRole: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);