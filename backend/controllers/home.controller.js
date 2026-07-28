const fs = require("fs");
const path = require("path");

const Achievement = require("../models/Achievement");
const TodayRose = require("../models/TodayRose");
const SchoolInfo = require("../models/SchoolInfo");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const GalleryPhoto = require("../models/GalleryPhoto");

// Helper: remove time from date, so one rose is saved for one calendar day.
const getStartOfDay = (dateValue = new Date()) => {
    const date = new Date(dateValue);
    date.setHours(0, 0, 0, 0);
    return date;
};

// Helper: all photos shown on the public home page are served from
// /uploads/home/<filename>. When Today's Rose reuses a student's existing
// profile photo (instead of a newly uploaded one), that file physically
// lives in /uploads/students/, so it must be copied into /uploads/home/
// first, otherwise the image URL built on the frontend (uploads/home/...)
// will 404.
const copyStudentPhotoToHome = (studentPhotoFilename) => {
    if (!studentPhotoFilename) return "";

    try {
        const sourcePath = path.join(
            __dirname,
            "..",
            "uploads",
            "students",
            studentPhotoFilename
        );

        if (!fs.existsSync(sourcePath)) return "";

        const homeDir = path.join(__dirname, "..", "uploads", "home");

        if (!fs.existsSync(homeDir)) {
            fs.mkdirSync(homeDir, { recursive: true });
        }

        const extension = path.extname(studentPhotoFilename);
        const newFilename = `${Date.now()}-${Math.round(
            Math.random() * 1e9
        )}${extension}`;

        fs.copyFileSync(sourcePath, path.join(homeDir, newFilename));

        return newFilename;
    } catch (error) {
        console.error("Copy student photo to home error:", error);
        return "";
    }
};

// Public home-page data
const getPublicHomeData = async (req, res) => {
    try {
        const today = getStartOfDay();

        const [
            schoolInfo,
            achievements,
            todayRoses,
            galleryPhotos,
            totalStudents,
            totalTeachers,
            classList,
            birthdayStudents
        ] = await Promise.all([
            SchoolInfo.findOne().lean(),

            Achievement.find({ isActive: true })
                .sort({ achievementDate: -1, createdAt: -1 })
                .limit(12)
                .lean(),

            TodayRose.find({ awardDate: today })
                .populate(
                    "studentId",
                    "fullName grNumber standard division profilePhoto photo"
                )
                .sort({ createdAt: -1 })
                .lean(),

            GalleryPhoto.find({ isActive: true })
                .sort({ order: 1, createdAt: -1 })
                .limit(20)
                .lean(),

            Student.countDocuments({}),

            Teacher.countDocuments({}),

            Student.aggregate([
                {
                    $group: {
                        _id: {
                            standard: "$standard",
                            division: "$division"
                        }
                    }
                }
            ]),

            Student.find({
                $expr: {
                    $and: [
                        {
                            $eq: [
                                { $dayOfMonth: "$dateOfBirth" },
                                new Date().getDate()
                            ]
                        },
                        {
                            $eq: [
                                { $month: "$dateOfBirth" },
                                new Date().getMonth() + 1
                            ]
                        }
                    ]
                }
            })
                .select(
                    "fullName grNumber standard division dateOfBirth profilePhoto photo"
                )
                .sort({ fullName: 1 })
                .lean()
        ]);

        res.status(200).json({
            success: true,
            schoolInfo: schoolInfo || {},
            achievements,
            todayRoses,
            galleryPhotos,
            birthdays: birthdayStudents,
            stats: {
                totalStudents,
                totalTeachers,
                totalClasses: classList.length,
                totalAchievements: achievements.length
            }
        });
    } catch (error) {
        console.error("Get public home data error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load home page data."
        });
    }
};

// Get school information for public page or admin management page
const getSchoolInfo = async (req, res) => {
    try {
        const schoolInfo = await SchoolInfo.findOne();

        res.status(200).json({
            success: true,
            schoolInfo: schoolInfo || {}
        });
    } catch (error) {
        console.error("Get school info error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load school information."
        });
    }
};

// Admin updates school information
const updateSchoolInfo = async (req, res) => {
    try {
        const {
            schoolName,
            tagline,
            about,
            phone,
            email,
            address,
            mapLink
        } = req.body;

        let schoolInfo = await SchoolInfo.findOne();

        const updateData = {
            schoolName: schoolName || "",
            tagline: tagline || "",
            about: about || "",
            phone: phone || "",
            email: email || "",
            address: address || "",
            mapLink: mapLink || ""
        };

        if (req.file) {
            updateData.logo = req.file.filename;
        }

        if (schoolInfo) {
            schoolInfo = await SchoolInfo.findByIdAndUpdate(
                schoolInfo._id,
                updateData,
                { new: true, runValidators: true }
            );
        } else {
            schoolInfo = await SchoolInfo.create(updateData);
        }

        res.status(200).json({
            success: true,
            message: "School information updated successfully.",
            schoolInfo
        });
    } catch (error) {
        console.error("Update school info error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to update school information."
        });
    }
};

// Admin creates an achievement
const createAchievement = async (req, res) => {
    try {
        const {
            title,
            description,
            achievementDate,
            category
        } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: "Achievement title and description are required."
            });
        }

        const achievement = await Achievement.create({
            title,
            description,
            category: category || "General",
            achievementDate: achievementDate || new Date(),
            photo: req.file ? req.file.filename : "",
            createdBy: req.user?._id
        });

        res.status(201).json({
            success: true,
            message: "Achievement added successfully.",
            achievement
        });
    } catch (error) {
        console.error("Create achievement error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to add achievement."
        });
    }
};

// Get all achievements for admin management
const getAchievements = async (req, res) => {
    try {
        const achievements = await Achievement.find()
            .sort({ achievementDate: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            achievements
        });
    } catch (error) {
        console.error("Get achievements error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load achievements."
        });
    }
};

// Delete an achievement
const deleteAchievement = async (req, res) => {
    try {
        const achievement = await Achievement.findByIdAndDelete(req.params.id);

        if (!achievement) {
            return res.status(404).json({
                success: false,
                message: "Achievement not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Achievement deleted successfully."
        });
    } catch (error) {
        console.error("Delete achievement error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to delete achievement."
        });
    }
};

// Admin creates or updates Today's Rose
const createTodayRose = async (req, res) => {
    try {
        const {
            studentId,
            title,
            reason,
            awardDate
        } = req.body;

        if (!studentId || !reason) {
            return res.status(400).json({
                success: false,
                message: "Please select a student and enter the award reason."
            });
        }

        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Selected student was not found."
            });
        }

        const date = getStartOfDay(awardDate || new Date());

        const photo = req.file
            ? req.file.filename
            : copyStudentPhotoToHome(student.profilePhoto || student.photo);

        const roseData = {
            studentId,
            studentName: student.fullName,
            grNumber: student.grNumber,
            standard: student.standard,
            division: student.division,
            title: title || "Today's Rose",
            reason,
            awardDate: date,
            photo,
            createdBy: req.user?._id
        };

        const todayRose = await TodayRose.findOneAndUpdate(
            { studentId, awardDate: date },
            roseData,
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        ).populate(
            "studentId",
            "fullName grNumber standard division profilePhoto photo"
        );

        res.status(200).json({
            success: true,
            message: "Today's Rose saved successfully.",
            todayRose
        });
    } catch (error) {
        console.error("Create today's rose error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "This student has already been awarded Today's Rose for this date."
            });
        }

        res.status(500).json({
            success: false,
            message: "Unable to save Today's Rose."
        });
    }
};

// Get all roses for admin management
const getTodayRoses = async (req, res) => {
    try {
        const todayRoses = await TodayRose.find()
            .populate(
                "studentId",
                "fullName grNumber standard division profilePhoto photo"
            )
            .sort({ awardDate: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            todayRoses
        });
    } catch (error) {
        console.error("Get today's roses error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load Today's Rose records."
        });
    }
};

// Delete one Today's Rose record
const deleteTodayRose = async (req, res) => {
    try {
        const todayRose = await TodayRose.findByIdAndDelete(req.params.id);

        if (!todayRose) {
            return res.status(404).json({
                success: false,
                message: "Today's Rose record not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Today's Rose deleted successfully."
        });
    } catch (error) {
        console.error("Delete today's rose error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to delete Today's Rose."
        });
    }
};

// Get all gallery photos for admin management
const getGalleryPhotos = async (req, res) => {
    try {
        const galleryPhotos = await GalleryPhoto.find().sort({
            order: 1,
            createdAt: -1
        });

        res.status(200).json({
            success: true,
            galleryPhotos
        });
    } catch (error) {
        console.error("Get gallery photos error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load gallery photos."
        });
    }
};

// Add a photo to the home page gallery slideshow
const addGalleryPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please choose a photo to upload."
            });
        }

        const existingCount = await GalleryPhoto.countDocuments();

        if (existingCount >= 20) {
            return res.status(400).json({
                success: false,
                message: "You can add a maximum of 20 gallery photos."
            });
        }

        const galleryPhoto = await GalleryPhoto.create({
            photo: req.file.filename,
            caption: req.body.caption || "",
            order: existingCount,
            createdBy: req.user?._id
        });

        res.status(201).json({
            success: true,
            message: "Gallery photo added successfully.",
            galleryPhoto
        });
    } catch (error) {
        console.error("Add gallery photo error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to add gallery photo."
        });
    }
};

// Delete a gallery photo
const deleteGalleryPhoto = async (req, res) => {
    try {
        const galleryPhoto = await GalleryPhoto.findByIdAndDelete(req.params.id);

        if (!galleryPhoto) {
            return res.status(404).json({
                success: false,
                message: "Gallery photo not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Gallery photo deleted successfully."
        });
    } catch (error) {
        console.error("Delete gallery photo error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to delete gallery photo."
        });
    }
};

module.exports = {
    getPublicHomeData,
    getSchoolInfo,
    updateSchoolInfo,
    createAchievement,
    getAchievements,
    deleteAchievement,
    createTodayRose,
    getTodayRoses,
    deleteTodayRose,
    getGalleryPhotos,
    addGalleryPhoto,
    deleteGalleryPhoto
};