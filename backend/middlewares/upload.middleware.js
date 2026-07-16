const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ======================================================
// Create Upload Folder if not exists
// ======================================================

const createUploader = (
    folderName,
    allowedTypes,
    maxSizeMB
) => {

    const uploadPath = path.join(
        __dirname,
        "..",
        "uploads",
        folderName
    );

    if (!fs.existsSync(uploadPath)) {

        fs.mkdirSync(uploadPath, {
            recursive: true
        });

    }

    const storage = multer.diskStorage({

        destination: (req, file, cb) => {

            cb(null, uploadPath);

        },

        filename: (req, file, cb) => {

            const uniqueName =
                Date.now() +
                "-" +
                Math.round(Math.random() * 1E9) +
                path.extname(file.originalname);

            cb(null, uniqueName);

        }

    });

    const fileFilter = (req, file, cb) => {

        if (
            allowedTypes.includes(file.mimetype)
        ) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`
                ),
                false
            );

        }

    };

    return multer({

        storage,

        fileFilter,

        limits: {

            fileSize:
                maxSizeMB *
                1024 *
                1024

        }

    });

};

// ======================================================
// Image Types
// ======================================================

const IMAGE_TYPES = [

    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"

];

// ======================================================
// Document Types
// ======================================================

const DOC_TYPES = [

    ...IMAGE_TYPES,

    "application/pdf",

    "application/msword",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "application/vnd.ms-excel",

    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

];

// ======================================================
// Uploaders
// ======================================================

// Student Photo
const upload = createUploader(

    "students",

    IMAGE_TYPES,

    2

);

// Teacher Photo
const uploadTeacher = createUploader(

    "teachers",

    IMAGE_TYPES,

    2

);

// Homework Question Upload
const uploadHomework = createUploader(

    "homework/questions",

    DOC_TYPES,

    10

);

// Homework Submission Upload
const uploadSubmission = createUploader(

    "homework/submissions",

    DOC_TYPES,

    10

);

// Notice Attachment Upload
const uploadNotice = createUploader(

    "notices",

    DOC_TYPES,

    10

);

// ======================================================
// Export All Uploaders
// ======================================================

module.exports = {

    upload,

    uploadTeacher,

    uploadHomework,

    uploadSubmission,

    uploadNotice

};