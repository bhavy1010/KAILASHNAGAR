const fs = require("fs");
const path = require("path");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const User = require("../models/User");
const { canUploadStudentPhoto, canUploadTeacherPhoto } = require("../services/authorization.service");

// ======================================================
// Upload Student Photo
// ======================================================

const uploadStudentPhoto = async (req, res) => {

    try {

        const { id } = req.params;

        const authorized = await canUploadStudentPhoto(req.user, id);
        if (!authorized) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to upload a photo for this student."
            });
        }

        const student = await Student.findById(id);

        if (!student) {

            return res.status(404).json({

                success: false,

                message: "Student Not Found"

            });

        }

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message: "Please select an image"

            });

        }

        if (student.photo) {

            const oldPhotoPath = path.join(

                __dirname,

                "../uploads/students",

                student.photo

            );

            if (fs.existsSync(oldPhotoPath)) {

                fs.unlinkSync(oldPhotoPath);

            }

        }

        student.photo = req.file.filename;

        await student.save();

        res.status(200).json({

            success: true,

            message: "Student photo uploaded successfully",

            photo: student.photo,

            imageUrl: `/uploads/students/${student.photo}`

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// ======================================================
// Upload Teacher Photo
// ======================================================

const uploadTeacherPhoto = async (req, res) => {

    try {

        const { id } = req.params;

        const authorized = await canUploadTeacherPhoto(req.user, id);
        if (!authorized) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to upload a photo for this teacher."
            });
        }

        const teacher = await Teacher.findById(id);

        if (!teacher) {

            return res.status(404).json({

                success: false,

                message: "Teacher Not Found"

            });

        }

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message: "Please select an image"

            });

        }

        if (teacher.photo) {

            const oldPhotoPath = path.join(

                __dirname,

                "../uploads/teachers",

                teacher.photo

            );

            if (fs.existsSync(oldPhotoPath)) {

                fs.unlinkSync(oldPhotoPath);

            }

        }

        teacher.photo = req.file.filename;

        await teacher.save();

        res.status(200).json({

            success: true,

            message: "Teacher photo uploaded successfully",

            photo: teacher.photo,

            imageUrl: `/uploads/teachers/${teacher.photo}`

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// ======================================================
// Upload Admin Photo
// ======================================================

const uploadAdminPhoto = async (req, res) => {

    try {

        const { id } = req.params;

        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Only admins can upload admin photos."
            });
        }

        const admin = await User.findById(id);

        if (!admin) {

            return res.status(404).json({

                success: false,

                message: "Admin Not Found"

            });

        }

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message: "Please select an image"

            });

        }

        if (admin.photo) {

            const oldPhotoPath = path.join(

                __dirname,

                "../uploads/admins",

                admin.photo

            );

            if (fs.existsSync(oldPhotoPath)) {

                fs.unlinkSync(oldPhotoPath);

            }

        }

        admin.photo = req.file.filename;

        await admin.save();

        res.status(200).json({

            success: true,

            message: "Admin photo uploaded successfully",

            photo: admin.photo,

            imageUrl: `/uploads/admins/${admin.photo}`

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

module.exports = {

    uploadStudentPhoto,

    uploadTeacherPhoto,

    uploadAdminPhoto

};