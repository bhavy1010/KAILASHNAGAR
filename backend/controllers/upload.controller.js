const fs = require("fs");
const path = require("path");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");

// ======================================================
// Upload Student Photo
// ======================================================

const uploadStudentPhoto = async (req, res) => {

    try {

        const { id } = req.params;

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

        // Delete old photo if exists

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

        // Save new filename

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

        // Delete old photo if exists

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

        // Save new filename

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





module.exports = {

    uploadStudentPhoto,

    uploadTeacherPhoto

};