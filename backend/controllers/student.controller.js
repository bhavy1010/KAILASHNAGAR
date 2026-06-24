const Student = require("../models/Student");

const createStudent = async (req, res) => {

    try {

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

        const student =
        await Student.create(req.body);

        res.status(201).json({
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

const getAllStudents = async (
    req,
    res
) => {

    try {

        const students =
            await Student.find()
            .populate(
                "classId",
                "className roomNumber"
            );
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

const getStudentByGR = async (
    req,
    res
) => {

    try {

        const student =
        await Student.findOne({

            grNumber:
            req.params.grNumber

        });

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

const searchStudents = async (
    req,
    res
) => {

    try {

        const keyword =
        req.query.keyword || "";

        const students =
        await Student.find({

            fullName: {

                $regex: keyword,

                $options: "i"

            }

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

const updateStudent = async (
    req,
    res
) => {

    try {

        const student =
        await Student.findByIdAndUpdate(

            req.params.id,

            req.body,

            {
                new: true,
                runValidators: true
            }

        );

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

const deleteStudent = async (
    req,
    res
) => {

    try {

        const student =
        await Student.findById(
            req.params.id
        );

        if (!student) {

            return res.status(404).json({

                success: false,
                message: "Student Not Found"

            });

        }

        await student.deleteOne();

        res.status(200).json({

            success: true,
            message: "Student Deleted"

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

const getStudentsPagination =
async (req, res) => {

    try {

        const page =
        Number(req.query.page) || 1;

        const limit =
        Number(req.query.limit) || 10;

        const skip =
        (page - 1) * limit;

        const students =
        await Student.find()
        .skip(skip)
        .limit(limit);

        const total =
        await Student.countDocuments();

        res.status(200).json({

            success: true,

            currentPage: page,

            totalPages:
            Math.ceil(total / limit),

            totalStudents: total,

            students

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

    getStudentByGR,

    searchStudents,

    updateStudent,

    deleteStudent,

    getStudentsPagination

};