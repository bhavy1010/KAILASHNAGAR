const mongoose = require("mongoose");

const galleryPhotoSchema = new mongoose.Schema(
    {
        photo: {
            type: String,
            required: true
        },

        caption: {
            type: String,
            default: "",
            trim: true
        },

        order: {
            type: Number,
            default: 0
        },

        isActive: {
            type: Boolean,
            default: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("GalleryPhoto", galleryPhotoSchema);