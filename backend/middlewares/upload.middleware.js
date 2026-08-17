const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ======================================================
// Magic number (file signature) verification
// Prevents MIME type spoofing by checking actual file bytes
// ======================================================

const MAGIC_NUMBERS = {
    "image/jpeg": { bytes: [0xFF, 0xD8, 0xFF], extensions: [".jpg", ".jpeg"] },
    "image/png": { bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], extensions: [".png"] },
    "image/webp": { bytes: [0x52, 0x49, 0x46, 0x46], extensions: [".webp"] },
    "application/pdf": { bytes: [0x25, 0x50, 0x44, 0x46], extensions: [".pdf"] },
    "application/msword": { bytes: [0xD0, 0xCF, 0x11, 0xE0], extensions: [".doc"] },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { bytes: [0x50, 0x4B, 0x03, 0x04], extensions: [".docx"] },
    "application/vnd.ms-excel": { bytes: [0xD0, 0xCF, 0x11, 0xE0], extensions: [".xls"] },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { bytes: [0x50, 0x4B, 0x03, 0x04], extensions: [".xlsx"] }
};

const verifyFileMagic = (buffer, mimetype) => {
    const spec = MAGIC_NUMBERS[mimetype];
    if (!spec) return true; // Unknown type, allow

    if (buffer.length < spec.bytes.length) {
        return false;
    }

    for (let i = 0; i < spec.bytes.length; i++) {
        if (buffer[i] !== spec.bytes[i]) {
            return false;
        }
    }

    return true;
};

const createUploader = (folderName, allowedTypes, maxSizeMB) => {
    const uploadPath = path.join(
        __dirname,
        "..",
        "uploads",
        folderName
    );

    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadPath);
        },

        filename: (req, file, cb) => {
            const extension = path.extname(file.originalname);
            const uniqueName = `${Date.now()}-${Math.round(
                Math.random() * 1e9
            )}${extension}`;

            cb(null, uniqueName);
        }
    });

    const fileFilter = (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    `Invalid file type. Allowed types: ${allowedTypes.join(
                        ", "
                    )}`
                ),
                false
            );
        }
    };

    return multer({
        storage,
        fileFilter,
        limits: {
            fileSize: maxSizeMB * 1024 * 1024
        }
    });
};

const IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
];

const DOCUMENT_TYPES = [
    ...IMAGE_TYPES,
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];

// Student photo upload
const upload = createUploader("students", IMAGE_TYPES, 2);
const uploadStudent = upload;

// Teacher photo upload
const uploadTeacher = createUploader("teachers", IMAGE_TYPES, 2);

// Admin photo upload
const uploadAdmin = createUploader("admins", IMAGE_TYPES, 2);

// School logo, achievement photo, and Today's Rose photo
const uploadHome = createUploader("home", IMAGE_TYPES, 5);

// Homework question/attachment upload
const uploadHomework = createUploader(
    "homework/questions",
    DOCUMENT_TYPES,
    10
);

// Student homework submission upload
const uploadSubmission = createUploader(
    "homework/submissions",
    DOCUMENT_TYPES,
    10
);

// Notice attachment upload
const uploadNotice = createUploader("notices", DOCUMENT_TYPES, 10);

// Leave request attachment upload (e.g. a medical certificate for
// sick leave). Same DOCUMENT_TYPES/10MB limit as notices/homework —
// images or PDF/Word/Excel, nothing executable.
const uploadLeave = createUploader("leaves", DOCUMENT_TYPES, 10);

// ======================================================
// Post-upload verification middleware
// Verifies file content matches declared MIME type
// ======================================================

const verifyUploadedFile = (req, res, next) => {
    if (!req.file) {
        return next();
    }

    const filePath = req.file.path;
    const buffer = fs.readFileSync(filePath);

    if (!verifyFileMagic(buffer, req.file.mimetype)) {
        fs.unlinkSync(filePath);
        return res.status(400).json({
            success: false,
            message: "File content does not match the expected file type. Upload rejected."
        });
    }

    next();
};

module.exports = {
    upload,
    uploadStudent,
    uploadTeacher,
    uploadAdmin,
    uploadHome,
    uploadHomework,
    uploadSubmission,
    uploadNotice,
    uploadLeave,
    verifyUploadedFile
};