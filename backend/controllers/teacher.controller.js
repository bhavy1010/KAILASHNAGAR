const Teacher = require("../models/Teacher");

// ======================================================
// Create Teacher
// If password is empty, mobile number becomes password
// ======================================================

const createTeacher = async (req, res) => {
    try {
        const mobile = req.body.mobile?.trim();

        if (!mobile) {
            return res.status(400).json({
                success: false,
                message: "Mobile number is required"
            });
        }

        const existingTeacher = await Teacher.findOne({
            mobile
        });

        if (existingTeacher) {
            return res.status(400).json({
                success: false,
                message: "Mobile Number Already Exists"
            });
        }

        const teacher = await Teacher.create({
            ...req.body,
            mobile,
            password: req.body.password?.trim() || mobile
        });

        res.status(201).json({
            success: true,
            message: "Teacher Added Successfully",
            teacher
        });

    } catch (error) {
        console.log("CREATE TEACHER ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// Get All Teachers
// ======================================================

const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find()
            .sort({
                createdAt: -1
            });

        res.status(200).json({
            success: true,
            count: teachers.length,
            teachers
        });

    } catch (error) {
        console.log("GET ALL TEACHERS ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// Get Teacher By ID
// ======================================================

const getTeacherById = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher Not Found"
            });
        }

        res.status(200).json({
            success: true,
            teacher
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// Get Teacher By Mobile Number
// ======================================================

const getTeacherByMobile = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({
            mobile: req.params.mobile
        });

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher Not Found"
            });
        }

        res.status(200).json({
            success: true,
            teacher
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// Update Teacher
// Password is changed only when Admin enters a new one
// ======================================================

const updateTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher Not Found"
            });
        }

        const newMobile = req.body.mobile?.trim();

        if (newMobile && newMobile !== teacher.mobile) {
            const existingTeacher = await Teacher.findOne({
                mobile: newMobile,
                _id: {
                    $ne: teacher._id
                }
            });

            if (existingTeacher) {
                return res.status(400).json({
                    success: false,
                    message: "Mobile Number Already Exists"
                });
            }

            teacher.mobile = newMobile;
        }

        teacher.fullName =
            req.body.fullName?.trim() || teacher.fullName;

        teacher.email =
            req.body.email?.trim() || teacher.email;

        teacher.gender =
            req.body.gender || teacher.gender;

        teacher.qualification =
            req.body.qualification?.trim() || teacher.qualification;

        teacher.subject =
            req.body.subject?.trim() || teacher.subject;

        teacher.experience =
            req.body.experience ?? teacher.experience;

        teacher.salary =
            req.body.salary ?? teacher.salary;

        teacher.classesHandled =
            req.body.classesHandled || teacher.classesHandled;

        teacher.joiningDate =
            req.body.joiningDate || teacher.joiningDate;

        teacher.address =
            req.body.address?.trim() || teacher.address;

        teacher.status =
            req.body.status || teacher.status;

        teacher.photo =
            req.body.photo || teacher.photo;

        // Teacher password can only be reset by Admin.
        // Saving with .save() keeps the password encrypted.
        if (req.body.password?.trim()) {
            teacher.password = req.body.password.trim();
        }

        await teacher.save();

        res.status(200).json({
            success: true,
            message: "Teacher Updated Successfully",
            teacher
        });

    } catch (error) {
        console.log("UPDATE TEACHER ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// Delete Teacher
// ======================================================

const deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher Not Found"
            });
        }

        await teacher.deleteOne();

        res.status(200).json({
            success: true,
            message: "Teacher Deleted"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// Search Teachers
// ======================================================

const searchTeachers = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";

        const teachers = await Teacher.find({
            $or: [
                {
                    fullName: {
                        $regex: keyword,
                        $options: "i"
                    }
                },
                {
                    mobile: {
                        $regex: keyword,
                        $options: "i"
                    }
                },
                {
                    subject: {
                        $regex: keyword,
                        $options: "i"
                    }
                }
            ]
        });

        res.status(200).json({
            success: true,
            count: teachers.length,
            teachers
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ======================================================
// Teacher Pagination
// ======================================================

const getTeachersPagination = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const teachers = await Teacher.find()
            .sort({
                createdAt: -1
            })
            .skip(skip)
            .limit(limit);

        const total = await Teacher.countDocuments();

        res.status(200).json({
            success: true,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalTeachers: total,
            teachers
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createTeacher,
    getAllTeachers,
    getTeacherById,
    getTeacherByMobile,
    updateTeacher,
    deleteTeacher,
    searchTeachers,
    getTeachersPagination
};