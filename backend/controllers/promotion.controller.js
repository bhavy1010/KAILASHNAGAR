const Student = require("../models/Student");
const Class = require("../models/Class");

const promoteStudents = async (
    req,
    res
) => {

    try {

        const {

            fromClassId,

            toClassId

        } = req.body;

        const targetClass =
        await Class.findById(
            toClassId
        );

        if (!targetClass) {

            return res.status(404).json({

                success: false,

                message:
                "Target Class Not Found"

            });

        }

        const students =
        await Student.find({

            classId:
            fromClassId

        });

        if (
            students.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                "No Students Found"

            });

        }

        await Student.updateMany(

            {
                classId:
                fromClassId
            },

            {

                $set: {

                    classId:
                    targetClass._id,

                    standard:
                    targetClass.standard,

                    division:
                    targetClass.division

                }

            }

        );

        res.status(200).json({

            success: true,

            promotedStudents:
            students.length,

            fromClassId,

            toClassId

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
    promoteStudents
};