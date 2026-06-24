const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

const getDashboardStats = async (
    req,
    res
) => {

    try {

        const totalStudents =
        await Student.countDocuments();

        const activeStudents =
        await Student.countDocuments({
            status: "Active"
        });

        const totalTeachers =
        await Teacher.countDocuments();

        const boysCount =
        await Student.countDocuments({
            gender: "Male"
        });

        const girlsCount =
        await Student.countDocuments({
            gender: "Female"
        });

        res.status(200).json({

            success: true,

            totalStudents,

            activeStudents,

            totalTeachers,

            boysCount,

            girlsCount

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

module.exports = {
    getDashboardStats
};