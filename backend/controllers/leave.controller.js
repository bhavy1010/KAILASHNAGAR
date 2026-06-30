const Leave =
require("../models/Leave");

const applyLeave =
async (req, res) => {

    try {

        const leave =
        await Leave.create(
            req.body
        );

        res.status(201).json({

            success: true,

            leave

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message:
            error.message

        });

    }

};

const getAllLeaves =
async (req, res) => {

    try {

        const leaves =
        await Leave.find()

        .populate(
            "teacherId",
            "fullName mobile"
        );

        res.status(200).json({

            success: true,

            count:
            leaves.length,

            leaves

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message:
            error.message

        });

    }

};

const updateLeaveStatus =
async (req, res) => {

    try {

        const leave =
        await Leave.findByIdAndUpdate(

            req.params.id,

            {

                status:
                req.body.status,

                adminRemark:
                req.body.adminRemark

            },

            {
                new: true
            }

        );

        if (!leave) {

            return res.status(404).json({

                success: false,

                message:
                "Leave Not Found"

            });

        }

        res.status(200).json({

            success: true,

            leave

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message:
            error.message

        });

    }

};

const getTeacherLeaves =
async (req, res) => {

    try {

        const leaves =
        await Leave.find({

            teacherId:
            req.params.teacherId

        });

        res.status(200).json({

            success: true,

            leaves

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message:
            error.message

        });

    }

};

module.exports = {

    applyLeave,

    getAllLeaves,

    updateLeaveStatus,

    getTeacherLeaves

};