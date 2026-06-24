// controllers/attendance.controller.js

const Attendance =
require("../models/Attendance");

const markClassAttendance =
async (req, res) => {

    try {

        const attendance =
        await Attendance.create({

            attendanceDate:
            req.body.attendanceDate,

            standard:
            req.body.standard,

            division:
            req.body.division,

            records:
            req.body.records

        });

        res.status(201).json({

            success: true,
            attendance

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

module.exports = {
    markClassAttendance
};