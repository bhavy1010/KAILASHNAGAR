const Leave = require("../models/Leave");

// ======================================================
// Apply For Leave
// ======================================================

const createLeave = async (req, res) => {

    try {

        const leave = await Leave.create({

            ...req.body,

            appliedBy: req.user.id

        });

        res.status(201).json({

            success: true,
            message: "Leave Request Submitted",
            leave

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// Get All Leaves (filterable by status)
// ======================================================

const getLeaves = async (req, res) => {

    try {

        const filter = {};

        if (req.query.status) {

            filter.status = req.query.status;

        }

        if (req.query.studentId) {

            filter.studentId = req.query.studentId;

        }

        const leaves = await Leave.find(filter)

            .populate("studentId", "fullName grNumber standard division")

            .sort({ createdAt: -1 });

        res.status(200).json({

            success: true,
            count: leaves.length,
            leaves

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ======================================================
// Approve / Reject Leave
// ======================================================

const updateLeaveStatus = async (req, res) => {

    try {

        const { status } = req.body;

        if (!["Approved", "Rejected"].includes(status)) {

            return res.status(400).json({

                success: false,
                message: "Invalid Status"

            });

        }

        const leave = await Leave.findByIdAndUpdate(

            req.params.id,

            {
                status,
                approvedBy: req.user.id
            },

            { new: true }

        );

        if (!leave) {

            return res.status(404).json({
                success: false,
                message: "Leave Request Not Found"
            });

        }

        res.status(200).json({

            success: true,
            message: `Leave ${status}`,
            leave

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    createLeave,
    getLeaves,
    updateLeaveStatus
};