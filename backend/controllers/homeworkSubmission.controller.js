const HomeworkSubmission =
require(
    "../models/HomeworkSubmission"
);

const Student =
require("../models/Student");


const submitHomework =
async (req, res) => {

    try {

        const submission =
        await HomeworkSubmission.create({

            homeworkId:
            req.body.homeworkId,

            studentId:
            req.body.studentId,

            status: "Submitted",

            submittedAt:
            new Date()

        });

        res.status(201).json({

            success: true,

            submission

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message:
            error.message

        });

    }

};

const getHomeworkCompletion =
async (req, res) => {

    try {

        const homeworkId =
        req.params.homeworkId;

        const totalStudents =
        await Student.countDocuments({

            classId:
            req.query.classId

        });

        const submittedCount =

        await HomeworkSubmission
        .countDocuments({

            homeworkId,

            status:
            "Submitted"

        });

        const completionPercentage =

        totalStudents > 0

        ? (
            submittedCount /
            totalStudents
          ) * 100

        : 0;

        res.status(200).json({

            success: true,

            totalStudents,

            submittedCount,

            completionPercentage:
            completionPercentage
            .toFixed(2)

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

    submitHomework,

    getHomeworkCompletion

};