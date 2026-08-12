const mongoose = require("mongoose");

const libraryMaterialSchema = new mongoose.Schema({
    classKey: { type: String, required: true, index: true },
    classLabel: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    coverImageUrl: { type: String, trim: true, default: "" },
    coverPublicId: { type: String, default: "" },
    coverResourceType: { type: String, default: "image" },
    fileUrl: { type: String, required: true },
    sourceType: { type: String, enum: ["upload", "textbook-link"], default: "upload" },
    publicId: { type: String, default: "" },
    resourceType: { type: String, default: "raw" },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

libraryMaterialSchema.index({ classKey: 1, subject: 1, createdAt: -1 });
module.exports = mongoose.model("LibraryMaterial", libraryMaterialSchema);
