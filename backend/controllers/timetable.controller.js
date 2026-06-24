const Timetable =
require("../models/Timetable");

const createTimetable =
async (req, res) => {

    try {

        const timetable =
        await Timetable.create(
            req.body
        );

        res.status(201).json({

            success: true,
            timetable

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

const getClassTimetable =
async (req, res) => {

    try {

        const timetable =
        await Timetable.find({

            classId:
            req.params.classId

        });

        res.status(200).json({

            success: true,

            timetable

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

module.exports = {

    createTimetable,

    getClassTimetable

};