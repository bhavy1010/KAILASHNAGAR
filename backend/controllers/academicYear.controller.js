const AcademicYear =
require("../models/AcademicYear");

const createAcademicYear =
async (req, res) => {

    try {

        const year =
        await AcademicYear.create(
            req.body
        );

        res.status(201).json({

            success: true,
            year

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message:
            error.message

        });

    }

};

const getAllAcademicYears =
async (req, res) => {

    try {

        const years =
        await AcademicYear.find()
        .sort({
            createdAt: -1
        });

        res.status(200).json({

            success: true,

            academicYears: years

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message:
            error.message

        });

    }

};

const setActiveYear =
async (req, res) => {

    try {

        await AcademicYear.updateMany(
            {},
            {
                isActive: false
            }
        );

        const activeYear =
        await AcademicYear.findByIdAndUpdate(

            req.params.id,

            {
                isActive: true
            },

            {
                new: true
            }

        );

        res.status(200).json({

            success: true,

            activeYear

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

    createAcademicYear,

    getAllAcademicYears,

    setActiveYear

};