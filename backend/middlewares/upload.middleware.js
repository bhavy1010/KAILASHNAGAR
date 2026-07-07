const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ======================================================
// Factory — creates a multer uploader for any subfolder
// ======================================================

const createUploader = (folderName, allowedTypes, maxSizeMB) => {

    const uploadPath = path.join(
        __dirname,
        `../uploads/${folderName}`
    );

    if (!fs.existsSync(uploadPath)) {

        fs.mkdirSync(uploadPath, { recursive: true });

    }

    const storage = multer.diskStorage({

        destination: function (req, file, cb) {

            cb(null, uploadPath);

        },

        filename: function (req, file, cb) {

            const uniqueName =
                Date.now() +
                "-" +
                Math.round(Math.random() * 1e9) +
                path.extname(file.originalname);

            cb(null, uniqueName);

        }

    });

    const fileFilter = (req, file, cb) => {

        if (allowedTypes.includes(file.mimetype)) {

            cb(null, true);

        } else {

            cb(

                new Error(

                    `Invalid file type. Allowed: ${allowedTypes.join(", ")}`

                )

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

// ======================================================
// Image types shorthand
// ======================================================

const IMAGE_TYPES = [

    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"

];

// ======================================================
// Document + image types (for homework attachments)
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
// Uploader instances
// ======================================================

// Student photos (2 MB, images only) — backward compatible default export
const upload = createUploader("students", IMAGE_TYPES, 2);

// Teacher photos
const uploadTeacher = createUploader("teachers", IMAGE_TYPES, 2);

// Homework attachments — teacher uploads question sheet (10 MB, docs + images)
const uploadHomework = createUploader("homework/questions", DOC_TYPES, 10);

// Homework submissions — student uploads answer file (10 MB, docs + images)
const uploadSubmission = createUploader("homework/submissions", DOC_TYPES, 10);

module.exports = upload;
module.exports.uploadTeacher = uploadTeacher;
module.exports.uploadHomework = uploadHomework;
module.exports.uploadSubmission = uploadSubmission;