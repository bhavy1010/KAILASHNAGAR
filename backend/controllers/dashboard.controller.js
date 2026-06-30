const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Class = require("../models/Class");

const getDashboardStats = async (req, res) => {

    try {

        const totalStudents = await Student.countDocuments();

        const totalTeachers = await Teacher.countDocuments();

        const totalClasses = await Class.countDocuments();

        const activeStudents = await Student.countDocuments({

            status: "Active"

        });

        const inactiveStudents = await Student.countDocuments({

            status: "Inactive"

        });

        const recentStudents = await Student.find()

            .sort({

                createdAt: -1

            })

            .limit(5)

            .select("fullName grNumber standard division");

        const recentTeachers = await Teacher.find()

            .sort({

                createdAt: -1

            })

            .limit(5)

            .select("fullName subject mobile");

        res.status(200).json({

            success: true,

            stats: {

                totalStudents,

                totalTeachers,

                totalClasses,

                activeStudents,

                inactiveStudents

            },

            recentStudents,

            recentTeachers

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