const mongoose = require("mongoose");

const libraryMaterialSchema = new mongoose.Schema({
    classKey: { type: String, required: true, index: true },
    classLabel: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    fileUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    resourceType: { type: String, default: "raw" },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

libraryMaterialSchema.index({ classKey: 1, subject: 1, createdAt: -1 });
module.exports = mongoose.model("LibraryMaterial", libraryMaterialSchema);
