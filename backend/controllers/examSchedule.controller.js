const ExamSchedule = require("../models/ExamSchedule");

// ======================================================
// Add Schedule Item
// POST /api/exam-schedule/add
// ======================================================

const addSchedule = async (req, res) => {

    try {

        const schedule = await ExamSchedule.create(req.body);

        res.status(201).json({

            success: true,
            message: "Schedule Added",
            schedule

        });

    } catch (error) {

        console.log("ADD SCHEDULE ERROR:", error);

        res.status(500).json({

            success: false,
            message: error.message,
            stack: error.stack

        });

    }

};

// ======================================================
// Get Schedule By Exam
// GET /api/exam-schedule/exam/:examId
// ======================================================

const getScheduleByExam = async (req, res) => {

    try {

        const schedule = await ExamSchedule.find({
            examId: req.params.examId
        }).sort({ examDate: 1 });

        res.status(200).json({

            success: true,
            count: schedule.length,
            schedule

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Update Schedule Item
// PUT /api/exam-schedule/:id
// ======================================================

const updateSchedule = async (req, res) => {

    try {

        const schedule = await ExamSchedule.findByIdAndUpdate(

            req.params.id,
            req.body,
            { new: true, runValidators: true }

        );

        if (!schedule) {

            return res.status(404).json({

                success: false,
                message: "Schedule Not Found"

            });

        }

        res.status(200).json({

            success: true,
            message: "Schedule Updated",
            schedule

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

// ======================================================
// Delete Schedule Item
// DELETE /api/exam-schedule/:id
// ======================================================

const deleteSchedule = async (req, res) => {

    try {

        const schedule = await ExamSchedule.findById(req.params.id);

        if (!schedule) {

            return res.status(404).json({

                success: false,
                message: "Schedule Not Found"

            });

        }

        await schedule.deleteOne();

        res.status(200).json({

            success: true,
            message: "Schedule Deleted"

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

module.exports = {
    addSchedule,
    getScheduleByExam,
    updateSchedule,
    deleteSchedule
};