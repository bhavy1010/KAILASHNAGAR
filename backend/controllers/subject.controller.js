const Subject =
require("../models/Subject");

const createSubject =
async (req, res) => {

    try {

        const existingSubject =
        await Subject.findOne({

            subjectCode:
            req.body.subjectCode

        });

        if (existingSubject) {

            return res.status(400)
            .json({

                success: false,

                message:
                "Subject Already Exists"

            });

        }

        const subject =
        await Subject.create(
            req.body
        );

        res.status(201).json({

            success: true,

            subject

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message:
            error.message

        });

    }

};
const getAllSubjects =
async (req, res) => {

    try {

        const subjects =
        await Subject.find();

        res.status(200).json({

            success: true,

            count:
            subjects.length,

            subjects

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message:
            error.message

        });

    }

};
const getSubjectById =
async (req, res) => {

    try {

        const subject =
        await Subject.findById(

            req.params.id

        );

        if (!subject) {

            return res.status(404)
            .json({

                success: false,

                message:
                "Subject Not Found"

            });

        }

        res.status(200).json({

            success: true,

            subject

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message:
            error.message

        });

    }

};
const updateSubject =
async (req, res) => {

    try {

        const subject =
        await Subject.findByIdAndUpdate(

            req.params.id,

            req.body,

            {
                new: true,
                runValidators: true
            }

        );

        if (!subject) {

            return res.status(404)
            .json({

                success: false,

                message:
                "Subject Not Found"

            });

        }

        res.status(200).json({

            success: true,

            subject

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message:
            error.message

        });

    }

};
const deleteSubject =
async (req, res) => {

    try {

        const subject =
        await Subject.findById(
            req.params.id
        );

        if (!subject) {

            return res.status(404)
            .json({

                success: false,

                message:
                "Subject Not Found"

            });

        }

        await subject.deleteOne();

        res.status(200).json({

            success: true,

            message:
            "Subject Deleted"

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

    createSubject,

    getAllSubjects,

    getSubjectById,

    updateSubject,

    deleteSubject

};