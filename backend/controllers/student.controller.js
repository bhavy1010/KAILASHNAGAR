const Student = require("../models/Student");

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
            !address
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields are mandatory."
            });
        }

        const password = createDobPassword(dateOfBirth);

        if (!password) {
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
            password,
            standard: Number(standard),
            division: division.trim().toUpperCase(),
            address: address.trim(),
            admissionDate: admissionDate || new Date(),
            status: status || "Active",
            photo: photo || ""
        });

        res.status(201).json({
            success: true,
            message:
                "Student created successfully. Password is generated from date of birth.",
            student
        });
    } catch (error) {
        console.error("Create student error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Unable to create student."
        });
    }
};

const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });

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

const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
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

const getStudentByGR = async (req, res) => {
    try {
        const student = await Student.findOne({
            grNumber: req.params.grNumber
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
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

const getStudentByName = async (req, res) => {
    try {
        const students = await Student.find({
            fullName: {
                $regex: req.params.fullName,
                $options: "i"
            }
        }).sort({ fullName: 1 });

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
        }).sort({ fullName: 1 });

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

const getStudentsPagination = async (req, res) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const [totalStudents, students] = await Promise.all([
            Student.countDocuments(),
            Student.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
        ]);

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

const updateStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
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
                    message: "GR Number already exists."
                });
            }
        }

        if (req.body.dateOfBirth) {
            const password = createDobPassword(req.body.dateOfBirth);

            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid date of birth."
                });
            }

            student.dateOfBirth = req.body.dateOfBirth;
            student.password = password;
        }

        student.grNumber = req.body.grNumber?.trim() || student.grNumber;
        student.fullName = req.body.fullName?.trim() || student.fullName;
        student.fatherName =
            req.body.fatherName?.trim() || student.fatherName;
        student.motherName =
            req.body.motherName?.trim() || student.motherName;
        student.gender = req.body.gender || student.gender;
        student.parentMobile =
            req.body.parentMobile?.trim() || student.parentMobile;
        student.standard =
            Number(req.body.standard) || student.standard;
        student.division =
            req.body.division?.trim().toUpperCase() || student.division;
        student.address = req.body.address?.trim() || student.address;
        student.admissionDate =
            req.body.admissionDate || student.admissionDate;
        student.status = req.body.status || student.status;
        student.photo = req.body.photo || student.photo;

        await student.save();

        res.status(200).json({
            success: true,
            message: "Student updated successfully.",
            student
        });
    } catch (error) {
        console.error("Update student error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Unable to update student."
        });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Student deleted successfully."
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