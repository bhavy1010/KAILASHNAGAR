const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true,
        trim: true
    },

    category: {
        type: String,
        enum: [
            "General",
            "Academic",
            "Exam",
            "Holiday",
            "Event",
            "Sports",
            "Fee",
            "Urgent",
            "Other"
        ],
        default: "General"
    },

    priority: {
        type: String,
        enum: ["Low", "Medium", "High", "Urgent"],
        default: "Medium"
    },

    audience: {
        type: String,
        enum: ["All", "Teachers", "Students", "Parents"],
        default: "All"
    },

    publishedBy: {
        type: String,
        default: "Admin"
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },

    attachment: {
        type: String,
        default: ""
    },

    attachmentOriginalName: {
        type: String,
        default: ""
    },

    publishDate: {
        type: Date,
        default: Date.now
    },

    expiryDate: {
        type: Date,
        default: null
    },

    isArchived: {
        type: Boolean,
        default: false
    },

    views: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});

noticeSchema.index({ audience: 1, isArchived: 1, publishDate: -1 });
noticeSchema.index({ category: 1 });

module.exports = mongoose.model("Notice", noticeSchema);