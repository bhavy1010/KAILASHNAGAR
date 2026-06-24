const Class = require("../models/Class");

const createClass = async (
    req,
    res
) => {

    try {

        const existingClass =
        await Class.findOne({

            className:
            req.body.className

        });

        if (existingClass) {

            return res.status(400).json({

                success: false,
                message:
                "Class Already Exists"

            });

        }

        const newClass =
        await Class.create(
            req.body
        );

        res.status(201).json({

            success: true,
            class: newClass

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

const getAllClasses =
async (req, res) => {

    try {

        const classes =
        await Class.find()
        .populate(
            "classTeacher",
            "fullName mobile"
        );

        res.status(200).json({

            success: true,

            count:
            classes.length,

            classes

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

module.exports = {

    createClass,

    getAllClasses

};