const mongoose = require("mongoose");

const homeworkSchema = new mongoose.Schema({

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

    subject: {
        type: String,
        required: true,
        trim: true
    },

    // Direct fields for fast filtering without joins
    standard: {
        type: Number,
        required: true
    },

    division: {
        type: String,
        required: true,
        trim: true
    },

    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true
    },

    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        
    },

    dueDate: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: ["Active", "Closed"],
        default: "Active"
    },

    // File attachment (question sheet, reference doc)
    attachment: {
        type: String,
        default: ""
    },

    attachmentOriginalName: {
        type: String,
        default: ""
    },

    academicYearId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AcademicYear",
        
    },

    totalMarks: {
        type: Number,
        default: 10
    }

}, {
    timestamps: true
});

// Index for fast class + status queries
homeworkSchema.index({ standard: 1, division: 1, status: 1 });
homeworkSchema.index({ teacherId: 1, createdAt: -1 });

module.exports = mongoose.model("Homework", homeworkSchema);