const Student = require("../models/Student");

// ======================================================
// Create Student
// ======================================================

const createStudent = async (req, res) => {

    try {

        const {
            grNumber,
            fullName,
            fatherName,
            motherName,
            gender,
            dateOfBirth,
            parentMobile,
            password,
            standard,
            division,
            classId,
            address,
            admissionDate,
            status,
            photo
        } = req.body;

        if (
            !grNumber ||
            !fullName ||
            !fatherName ||
            !motherName ||
            !gender ||
            !dateOfBirth ||
            !parentMobile ||
            !password ||
            !standard ||
            !division ||
            !classId ||
            !address
        ) {

            return res.status(400).json({

                success: false,
                message: "All required fields are mandatory."

            });

        }

        const existingStudent = await Student.findOne({

            grNumber: grNumber.trim()

        });

        if (existingStudent) {

            return res.status(400).json({

                success: false,
                message: "Student already exists with this GR Number."

            });

        }

        const student = await Student.create({

            grNumber: grNumber.trim(),

            fullName: fullName.trim(),

            fatherName: fatherName.trim(),

            motherName: motherName.trim(),

            gender,

            dateOfBirth,

            parentMobile,

            password,

            standard,

            division,

            classId,

            address: address.trim(),

            admissionDate,

            status,

            photo

        });

        res.status(201).json({

            success: true,

            message: "Student Created Successfully.",

            student

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// ======================================================
// Get All Students
// ======================================================

const getAllStudents = async (req, res) => {

    try {

        const students = await Student.find()

            .populate("classId")

            .sort({

                createdAt: -1

            });

        res.status(200).json({

            success: true,

            count: students.length,

            students

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// ======================================================
// Get Student By ID
// ======================================================

const getStudentById = async (req, res) => {

    try {

        const student = await Student.findById(

            req.params.id

        ).populate("classId");

        if (!student) {

            return res.status(404).json({

                success: false,

                message: "Student Not Found"

            });

        }

        res.status(200).json({

            success: true,

            student

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// ======================================================
// Get Student By GR Number
// ======================================================

const getStudentByGR = async (req, res) => {

    try {

        const student = await Student.findOne({

            grNumber: req.params.grNumber

        }).populate("classId");

        if (!student) {

            return res.status(404).json({

                success: false,
                message: "Student Not Found"

            });

        }

        res.status(200).json({

            success: true,
            student

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Get Student By Name
// ======================================================

const getStudentByName = async (req, res) => {

    try {

        const students = await Student.find({

            fullName: {

                $regex: req.params.fullName,

                $options: "i"

            }

        }).populate("classId");

        if (students.length === 0) {

            return res.status(404).json({

                success: false,
                message: "No Student Found"

            });

        }

        res.status(200).json({

            success: true,
            count: students.length,
            students

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Search Students
// ======================================================

const searchStudents = async (req, res) => {

    try {

        const keyword = req.query.keyword || "";

        const students = await Student.find({

            $or: [

                {

                    fullName: {

                        $regex: keyword,

                        $options: "i"

                    }

                },

                {

                    grNumber: {

                        $regex: keyword,

                        $options: "i"

                    }

                },

                {

                    parentMobile: {

                        $regex: keyword,

                        $options: "i"

                    }

                }

            ]

        })

        .populate("classId")

        .sort({

            fullName: 1

        });

        res.status(200).json({

            success: true,

            count: students.length,

            students

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// ======================================================
// Pagination
// ======================================================

const getStudentsPagination = async (req, res) => {

    try {

        const page = Number(req.query.page) || 1;

        const limit = Number(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        const totalStudents = await Student.countDocuments();

        const students = await Student.find()

            .populate("classId")

            .skip(skip)

            .limit(limit)

            .sort({

                createdAt: -1

            });

        res.status(200).json({

            success: true,

            currentPage: page,

            totalPages: Math.ceil(totalStudents / limit),

            totalStudents,

            students

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// ======================================================
// Update Student
// ======================================================

const updateStudent = async (req, res) => {

    try {

        const student = await Student.findById(req.params.id);

        if (!student) {

            return res.status(404).json({

                success: false,
                message: "Student Not Found"

            });

        }

        // Check duplicate GR Number

        if (
            req.body.grNumber &&
            req.body.grNumber !== student.grNumber
        ) {

            const existingStudent =
                await Student.findOne({

                    grNumber: req.body.grNumber

                });

            if (existingStudent) {

                return res.status(400).json({

                    success: false,
                    message: "GR Number Already Exists"

                });

            }

        }

        // Update fields

        student.grNumber =
            req.body.grNumber || student.grNumber;

        student.fullName =
            req.body.fullName || student.fullName;

        student.fatherName =
            req.body.fatherName || student.fatherName;

        student.motherName =
            req.body.motherName || student.motherName;

        student.gender =
            req.body.gender || student.gender;

        student.dateOfBirth =
            req.body.dateOfBirth || student.dateOfBirth;

        student.parentMobile =
            req.body.parentMobile || student.parentMobile;

        student.standard =
            req.body.standard || student.standard;

        student.division =
            req.body.division || student.division;

        student.classId =
            req.body.classId || student.classId;

        student.address =
            req.body.address || student.address;

        student.status =
            req.body.status || student.status;

        student.photo =
            req.body.photo || student.photo;

        // Change password only if provided

        if (req.body.password) {

            student.password =
                req.body.password;

        }

        await student.save();

        res.status(200).json({

            success: true,
            message: "Student Updated Successfully",
            student

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Delete Student
// ======================================================

const deleteStudent = async (req, res) => {

    try {

        const student = await Student.findById(req.params.id);

        if (!student) {

            return res.status(404).json({

                success: false,
                message: "Student Not Found"

            });

        }

        await student.deleteOne();

        res.status(200).json({

            success: true,
            message: "Student Deleted Successfully"

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

module.exports = {

    createStudent,

    getAllStudents,

    getStudentById,

    getStudentByGR,

    getStudentByName,

    searchStudents,

    updateStudent,

    deleteStudent,

    getStudentsPagination

};