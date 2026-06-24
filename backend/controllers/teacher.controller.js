const Teacher = require("../models/Teacher");

const createTeacher = async (req, res) => {

    try {

        const teacher = await Teacher.create(req.body);

        res.status(201).json({
            success: true,
            teacher
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const getAllTeachers = async (req, res) => {

    try {

        const teachers = await Teacher.find();

        res.status(200).json({
            success: true,
            count: teachers.length,
            teachers
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const getTeacherByMobile = async (req, res) => {

    try {

        const teacher = await Teacher.findOne({
            mobile: req.params.mobile
        });

        if (!teacher) {

            return res.status(404).json({
                success: false,
                message: "Teacher Not Found"
            });

        }

        res.status(200).json({
            success: true,
            teacher
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const updateTeacher = async (req, res) => {

    try {

        const teacher = await Teacher.findByIdAndUpdate(

            req.params.id,
            req.body,

            {
                new: true,
                runValidators: true
            }

        );

        if (!teacher) {

            return res.status(404).json({
                success: false,
                message: "Teacher Not Found"
            });

        }

        res.status(200).json({
            success: true,
            teacher
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const deleteTeacher = async (req, res) => {

    try {

        const teacher =
        await Teacher.findById(req.params.id);

        if (!teacher) {

            return res.status(404).json({
                success: false,
                message: "Teacher Not Found"
            });

        }

        await teacher.deleteOne();

        res.status(200).json({

            success: true,
            message: "Teacher Deleted"

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

const searchTeachers = async (req, res) => {

    try {

        const keyword = req.query.keyword || "";

        const teachers = await Teacher.find({

            fullName: {
                $regex: keyword,
                $options: "i"
            }

        });

        res.status(200).json({

            success: true,
            count: teachers.length,
            teachers

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

const getTeachersPagination = async (
    req,
    res
) => {

    try {

        const page =
        Number(req.query.page) || 1;

        const limit =
        Number(req.query.limit) || 10;

        const skip =
        (page - 1) * limit;

        const teachers =
        await Teacher.find()
        .skip(skip)
        .limit(limit);

        const total =
        await Teacher.countDocuments();

        res.status(200).json({

            success: true,

            currentPage: page,

            totalPages:
            Math.ceil(total / limit),

            totalTeachers: total,

            teachers

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

module.exports = {

    createTeacher,
    getAllTeachers,
    getTeacherByMobile,

    updateTeacher,
    deleteTeacher,

    searchTeachers,
    getTeachersPagination

};