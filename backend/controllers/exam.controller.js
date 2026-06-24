const Exam = require("../models/Exam");

const createExam = async (
    req,
    res
) => {

    try {

        const exam =
        await Exam.create(req.body);

        res.status(201).json({

            success: true,
            exam

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

const getAllExams = async (
    req,
    res
) => {

    try {

        const exams =
        await Exam.find()
        .populate(
            "classId",
            "className"
        );

        res.status(200).json({

            success: true,
            exams

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

module.exports = {

    createExam,

    getAllExams

};