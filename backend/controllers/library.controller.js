const crypto = require("crypto");
const LibraryMaterial = require("../models/LibraryMaterial");

const cloudinaryConfig = () => ({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (file) => {
    const { cloudName, apiKey, apiSecret } = cloudinaryConfig();
    if (!cloudName || !apiKey || !apiSecret) throw new Error("Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET to .env.");
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "school-library";
    // PDFs must be uploaded as an image resource to preserve browser PDF
    // delivery. Presentations are stored as raw files without conversion.
    const resourceType = file.mimetype === "application/pdf" || file.mimetype.startsWith("image/") ? "image" : "raw";
    const signature = crypto.createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`).digest("hex");
    const form = new FormData();
    form.append("file", new Blob([file.buffer], { type: file.mimetype }), file.originalname);
    form.append("api_key", apiKey);
    form.append("timestamp", String(timestamp));
    form.append("folder", folder);
    form.append("signature", signature);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, { method: "POST", body: form });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Cloudinary upload failed.");
    return data;
};

const removeFromCloudinary = async (material) => {
    const { cloudName, apiKey, apiSecret } = cloudinaryConfig();
    if (!cloudName || !apiKey || !apiSecret) return;
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto.createHash("sha1").update(`public_id=${material.publicId}&timestamp=${timestamp}${apiSecret}`).digest("hex");
    const form = new URLSearchParams({ public_id: material.publicId, api_key: apiKey, timestamp: String(timestamp), signature });
    await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${material.resourceType || "raw"}/destroy`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form });
};

const createMaterial = async (req, res) => {
    try {
        const { classKey, classLabel, subject, title, description } = req.body;
        if (!classKey || !classLabel || !subject || !title || !req.file) return res.status(400).json({ success: false, message: "Class, subject, title and file are required." });
        const uploaded = await uploadToCloudinary(req.file);
        const material = await LibraryMaterial.create({ classKey, classLabel, subject, title, description, fileUrl: uploaded.secure_url, publicId: uploaded.public_id, resourceType: uploaded.resource_type, fileName: req.file.originalname, fileType: req.file.mimetype, fileSize: req.file.size, uploadedBy: req.user.id });
        res.status(201).json({ success: true, material });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const createTextbookLink = async (req, res) => {
    try {
        const { classKey, classLabel, subject, title, pdfUrl, description = "" } = req.body;
        if (!classKey || !classLabel || !subject || !title || !pdfUrl || !req.file) return res.status(400).json({ success: false, message: "Standard, subject, book name, PDF URL and cover image are required." });
        try {
            const parsedUrl = new URL(pdfUrl);
            if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error();
        } catch { return res.status(400).json({ success: false, message: "Please enter a valid PDF URL." }); }
        const cover = await uploadToCloudinary(req.file);
        const material = await LibraryMaterial.create({
            classKey, classLabel, subject, title, description, coverImageUrl: cover.secure_url,
            coverPublicId: cover.public_id, coverResourceType: cover.resource_type, fileUrl: pdfUrl,
            sourceType: "textbook-link", fileName: `${title}.pdf`, fileType: "application/pdf",
            uploadedBy: req.user.id
        });
        res.status(201).json({ success: true, material });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const getMaterials = async (req, res) => {
    try {
        const filter = {};
        if (req.query.classKey) filter.classKey = req.query.classKey;
        if (req.query.subject) filter.subject = req.query.subject;
        const materials = await LibraryMaterial.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, materials });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const deleteMaterial = async (req, res) => {
    try {
        const material = await LibraryMaterial.findById(req.params.id);
        if (!material) return res.status(404).json({ success: false, message: "Material not found." });
        if (material.sourceType === "upload") await removeFromCloudinary(material);
        if (material.sourceType === "textbook-link" && material.coverPublicId) {
            await removeFromCloudinary({ publicId: material.coverPublicId, resourceType: material.coverResourceType });
        }
        await material.deleteOne();
        res.json({ success: true, message: "Material deleted." });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

module.exports = { createMaterial, createTextbookLink, getMaterials, deleteMaterial };
