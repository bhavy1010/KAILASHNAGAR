const Achievement = require("../models/Achievement");
const TodayRose = require("../models/TodayRose");
const Student = require("../models/Student");
const SchoolInfo = require("../models/SchoolInfo");

// ======================================================
// Date Helper
// ======================================================

const getStartOfDay = (value = new Date()) => {
    const date = new Date(value);

    date.setHours(0, 0, 0, 0);

    return date;
};

// ======================================================
// Public Home Page Data
// Birthdays, Today's Rose and Achievements
// ======================================================

const getPublicHomeData = async (req, res) => {
    try {
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();

        const birthdays = await Student.find({
            status: "Active",
            $expr: {
                $and: [
                    {
                        $eq: [
                            { $month: "$dateOfBirth" },
                            month
                        ]
                    },
                    {
                        $eq: [
                            { $dayOfMonth: "$dateOfBirth" },
                            day
                        ]
                    }
                ]
            }
        })
            .select(
                "fullName grNumber standard division photo dateOfBirth"
            )
            .sort({
                fullName: 1
            });

        const todayRose = await TodayRose.findOne({
            awardDate: getStartOfDay(),
            isPublished: true
        }).populate(
            "student",
            "fullName grNumber standard division photo"
        );

        const achievements = await Achievement.find({
            isPublished: true
        })
            .sort({
                achievementDate: -1,
                createdAt: -1
            })
            .limit(6);

            const schoolInfo = await SchoolInfo.findOne();

        res.status(200).json({
            success: true,
            schoolInfo,
            birthdays,
            todayRose,
            achievements
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// Achievement: Create
// ======================================================

const createAchievement = async (req, res) => {
    try {
        const {
            title,
            description,
            photo,
            achievementDate,
            isPublished
        } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Title and description are required"
            });
        }

        const achievement = await Achievement.create({
            title: title.trim(),
            description: description.trim(),
            photo: req.file
    ? `/uploads/home/${req.file.filename}`
    : photo || "",
            achievementDate: achievementDate || new Date(),
            isPublished:
                typeof isPublished === "boolean"
                    ? isPublished
                    : true
        });

        res.status(201).json({
            success: true,
            message: "Achievement added successfully",
            achievement
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// Achievement: Get All for Admin
// ======================================================

const getAllAchievements = async (req, res) => {
    try {
        const achievements = await Achievement.find()
            .sort({
                achievementDate: -1,
                createdAt: -1
            });

        res.status(200).json({
            success: true,
            count: achievements.length,
            achievements
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// Achievement: Update
// ======================================================

const updateAchievement = async (req, res) => {
    if (req.file) {
    req.body.photo = `/uploads/home/${req.file.filename}`;
}
    try {
        const achievement = await Achievement.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!achievement) {
            return res.status(404).json({
                success: false,
                message: "Achievement not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Achievement updated successfully",
            achievement
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// Achievement: Delete
// ======================================================

const deleteAchievement = async (req, res) => {
    try {
        const achievement = await Achievement.findByIdAndDelete(
            req.params.id
        );

        if (!achievement) {
            return res.status(404).json({
                success: false,
                message: "Achievement not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Achievement deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// Today's Rose: Create or Replace
// One student can receive Today's Rose each day
// ======================================================

const saveTodayRose = async (req, res) => {
    try {
        const {
            studentId,
            title,
            reason,
            photo,
            awardDate,
            isPublished
        } = req.body;

        if (!studentId || !reason) {
            return res.status(400).json({
                success: false,
                message: "Student and award reason are required"
            });
        }

        const student = await Student.findOne({
            _id: studentId,
            status: "Active"
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Active student not found"
            });
        }

        const normalizedAwardDate = getStartOfDay(
            awardDate || new Date()
        );

        const todayRose = await TodayRose.findOneAndUpdate(
            {
                awardDate: normalizedAwardDate
            },
            {
                student: studentId,
                title: title?.trim() || "Today's Rose",
                reason: reason.trim(),
                photo: req.file
                ? `/uploads/home/${req.file.filename}`
                : photo || "",
                awardDate: normalizedAwardDate,
                isPublished:
                    typeof isPublished === "boolean"
                        ? isPublished
                        : true
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        ).populate(
            "student",
            "fullName grNumber standard division photo"
        );

        res.status(200).json({
            success: true,
            message: "Today's Rose saved successfully",
            todayRose
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// Today's Rose: Get All for Admin
// ======================================================

const getAllTodayRoses = async (req, res) => {
    try {
        const todayRoses = await TodayRose.find()
            .populate(
                "student",
                "fullName grNumber standard division photo"
            )
            .sort({
                awardDate: -1
            });

        res.status(200).json({
            success: true,
            count: todayRoses.length,
            todayRoses
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// Today's Rose: Delete
// ======================================================

const deleteTodayRose = async (req, res) => {
    try {
        const todayRose = await TodayRose.findByIdAndDelete(
            req.params.id
        );

        if (!todayRose) {
            return res.status(404).json({
                success: false,
                message: "Today's Rose record not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Today's Rose record deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// School Information: Get
// ======================================================

const getSchoolInfo = async (req, res) => {
    try {
        const schoolInfo = await SchoolInfo.findOne();

        res.status(200).json({
            success: true,
            schoolInfo
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// School Information: Create or Update
// Admin only
// ======================================================

const updateSchoolInfo = async (req, res) => {
    try {
        const schoolInfo = await SchoolInfo.findOneAndUpdate(
            {},
            {
                schoolName: req.body.schoolName,
                tagline: req.body.tagline,
                about: req.body.about,
                phone: req.body.phone,
                email: req.body.email,
                address: req.body.address,
                mapLink: req.body.mapLink
            },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true
            }
        );

        res.status(200).json({
            success: true,
            message: "School information updated successfully",
            schoolInfo
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getPublicHomeData,
    createAchievement,
    getAllAchievements,
    updateAchievement,
    deleteAchievement,
    saveTodayRose,
    getAllTodayRoses,
    deleteTodayRose,
    getSchoolInfo,
    updateSchoolInfo
};