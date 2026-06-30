const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Factory: creates a multer instance for a given uploads subfolder
const createUploader = (folderName) => {

    const uploadPath = path.join(__dirname, `../uploads/${folderName}`);

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

        const allowed = [

            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"

        ];

        if (allowed.includes(file.mimetype)) {

            cb(null, true);

        } else {

            cb(new Error("Only JPG, PNG and WEBP images are allowed."));

        }

    };

    return multer({

        storage,

        fileFilter,

        limits: {

            fileSize: 2 * 1024 * 1024

        }

    });

};

// Existing student upload (kept for backward compatibility)
const upload = createUploader("students");

// New teacher upload
const uploadTeacher = createUploader("teachers");

module.exports = upload;
module.exports.uploadTeacher = uploadTeacher;