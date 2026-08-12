const mongoose = require("mongoose");

const videoLibrarySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true,
            default: ""
        },
        youtubeUrl: {
            type: String,
            required: true,
            trim: true
        },
        youtubeVideoId: {
            type: String,
            required: true,
            trim: true
        },
        targetScope: {
            type: String,
            enum: ["whole_school", "class_specific"],
            required: true,
            default: "class_specific"
        },
        standard: {
            type: Number,
            default: null
        },
        subject: {
            type: String,
            trim: true,
            default: "Extra / General"
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        uploadedByName: {
            type: String,
            default: "Staff"
        },
        uploadedByRole: {
            type: String,
            enum: ["admin", "teacher"],
            required: true
        }
    },
    {
        timestamps: true
    }
);

videoLibrarySchema.index({ targetScope: 1, standard: 1, subject: 1, createdAt: -1 });

module.exports = mongoose.model("VideoLibrary", videoLibrarySchema);
