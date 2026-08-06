const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

module.exports = {
    upload,
    uploadStudent,
    uploadTeacher,
    uploadHome,
    uploadHomework,
    uploadSubmission,
    uploadNotice,
    uploadLeave
};