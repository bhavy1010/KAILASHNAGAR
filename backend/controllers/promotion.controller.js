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

        if (!fromClassId || !toClassId) {

            return res.status(400).json({

                success: false,

                message:
                "fromClassId and toClassId are required"

            });

        }

        // Resolve both Class documents up front - the Student model
        // has no classId field, so students are matched by their
        // standard + division instead (same as the rest of the app,
        // e.g. getHomeworkForStudent).
        const sourceClass =
        await Class.findById(
            fromClassId
        );

        if (!sourceClass) {

            return res.status(404).json({

                success: false,

                message:
                "Source Class Not Found"

            });

        }

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

        const studentFilter = {

            standard:
            sourceClass.standard,

            division:
            sourceClass.division

        };

        const students =
        await Student.find(
            studentFilter
        );

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

            studentFilter,

            {

                $set: {

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