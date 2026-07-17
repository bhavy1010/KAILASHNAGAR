const Student = require("../models/Student");

// ======================================================
// Student Password from Date of Birth
// Example: 10/10/2005 = 101005
// ======================================================

const createDobPassword = (dateOfBirth) => {
    const rawDate = String(dateOfBirth);

    if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        const [year, month, day] = rawDate.split("-");

        return `${day}${month}${year.slice(-2)}`;
    }

    const date = new Date(dateOfBirth);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = String(date.getUTCFullYear()).slice(-2);

    return `${day}${month}${year}`;
};

// ======================================================
// Create Student
// Password is automatically generated from DOB
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

        const studentPassword = createDobPassword(dateOfBirth);

        if (!studentPassword) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid date of birth."
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
            parentMobile: parentMobile.trim(),
            password: studentPassword,
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
            message: "Student created successfully. Student password is their date of birth.",
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
// If DOB changes, student password changes automatically
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

        if (
            req.body.grNumber &&
            req.body.grNumber.trim() !== student.grNumber
        ) {
            const existingStudent = await Student.findOne({
                grNumber: req.body.grNumber.trim()
            });

            if (existingStudent) {
                return res.status(400).json({
                    success: false,
                    message: "GR Number Already Exists"
                });
            }
        }

        if (req.body.dateOfBirth) {
            const studentPassword = createDobPassword(req.body.dateOfBirth);

            if (!studentPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid date of birth."
                });
            }

            student.dateOfBirth = req.body.dateOfBirth;
            student.password = studentPassword;
        }

        student.grNumber =
            req.body.grNumber?.trim() || student.grNumber;

        student.fullName =
            req.body.fullName?.trim() || student.fullName;

        student.fatherName =
            req.body.fatherName?.trim() || student.fatherName;

        student.motherName =
            req.body.motherName?.trim() || student.motherName;

        student.gender =
            req.body.gender || student.gender;

        student.parentMobile =
            req.body.parentMobile?.trim() || student.parentMobile;

        student.standard =
            req.body.standard || student.standard;

        student.division =
            req.body.division || student.division;

        student.classId =
            req.body.classId || student.classId;

        student.address =
            req.body.address?.trim() || student.address;

        student.status =
            req.body.status || student.status;

        student.photo =
            req.body.photo || student.photo;

        await student.save();

        res.status(200).json({
            success: true,
            message: "Student updated successfully.",
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