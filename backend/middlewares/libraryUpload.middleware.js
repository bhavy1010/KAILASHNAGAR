const multer = require("multer");

const allowedTypes = [
    "application/pdf", "image/jpeg", "image/png", "image/webp",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
];

module.exports = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
    fileFilter: (req, file, done) => {
        if (allowedTypes.includes(file.mimetype)) return done(null, true);
        done(new Error("Only PDF, image, PPT and PPTX files are allowed."));
    }
});
