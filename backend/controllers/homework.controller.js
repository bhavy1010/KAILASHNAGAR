const Homework =
require("../models/Homework");

const createHomework =
async (req, res) => {

    try {

        const homework =
        await Homework.create(
            req.body
        );

        res.status(201).json({

            success: true,
            homework

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};
const getAllHomework =
async (req, res) => {

    try {

        const homework =
        await Homework.find()

        .populate(
            "classId",
            "className"
        )

        .populate(
            "teacherId",
            "fullName"
        );

        res.status(200).json({

            success: true,

            count:
            homework.length,

            homework

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

const getHomeworkByClass =
async (req, res) => {

    try {

        const homework =
        await Homework.find({

            classId:
            req.params.classId

        });

        res.status(200).json({

            success: true,

            count:
            homework.length,

            homework

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

module.exports = {

    createHomework,

    getAllHomework,

    getHomeworkByClass

};