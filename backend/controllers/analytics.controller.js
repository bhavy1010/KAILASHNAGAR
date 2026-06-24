const Result = require("../models/Result");
const Student = require("../models/Student");

const getClassAnalytics = async (
    req,
    res
) => {

    try {

        const classId =
        req.params.classId;

        const students =
        await Student.find({
            classId
        });

        const rankings = [];

        for (
            const student
            of students
        ) {

            const results =
            await Result.find({

                studentId:
                student._id

            });

            let total = 0;

            let obtained = 0;

            results.forEach(
                result => {

                total +=
                result.totalMarks;

                obtained +=
                result.marksObtained;

            });

            const percentage =
            total > 0

            ? (
                obtained / total
              ) * 100

            : 0;

            rankings.push({

                studentId:
                student._id,

                fullName:
                student.fullName,

                percentage:
                percentage

            });

        }

        rankings.sort(
            (a, b) =>
            b.percentage -
            a.percentage
        );

        rankings.forEach(
            (
                student,
                index
            ) => {

            student.rank =
            index + 1;

        });

        const classAverage =

        rankings.length > 0

        ? rankings.reduce(

            (sum, student) =>

            sum +
            student.percentage,

            0

        ) / rankings.length

        : 0;

        const toppers =
        rankings.slice(0, 3);

        const failList =
        rankings.filter(

            student =>

            student.percentage
            < 35

        );

        res.status(200).json({

            success: true,

            classAverage:
            classAverage.toFixed(2),

            toppers,

            failList,

            rankings

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
    getClassAnalytics
};