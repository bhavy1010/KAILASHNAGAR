const Result =
require("../models/Result");

const addResult =
async (req, res) => {

    try {

        const result =
        await Result.create(
            req.body
        );

        res.status(201).json({

            success: true,
            result

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};

const getStudentResults =
async (req, res) => {

    try {

        const results =
        await Result.find({

            studentId:
            req.params.studentId

        })

        .populate(
            "examId"
        );

        res.status(200).json({

            success: true,

            results

        });

    } catch (error) {

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};


const generateReportCard =
async (req, res) => {

    try {

        const results =
        await Result.find({

            studentId:
            req.params.studentId

        });

        if (
            results.length === 0
        ) {

            return res.status(404)
            .json({

                success: false,

                message:
                "No Results Found"

            });

        }

        let totalMarks = 0;

        let obtainedMarks = 0;

        results.forEach(result => {

            totalMarks +=
            result.totalMarks;

            obtainedMarks +=
            result.marksObtained;

        });

        const percentage =

            (
                obtainedMarks /
                totalMarks
            ) * 100;

        let grade = "F";

        if (percentage >= 90)
            grade = "A+";

        else if (
            percentage >= 80
        )
            grade = "A";

        else if (
            percentage >= 70
        )
            grade = "B";

        else if (
            percentage >= 60
        )
            grade = "C";

        else if (
            percentage >= 35
        )
            grade = "D";

        const resultStatus =
        percentage >= 35
        ? "PASS"
        : "FAIL";

        res.status(200).json({

            success: true,

            totalMarks,

            obtainedMarks,

            percentage:
            percentage.toFixed(2),

            grade,

            resultStatus,

            subjectResults:
            results

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

    addResult,

    getStudentResults,

    generateReportCard

};