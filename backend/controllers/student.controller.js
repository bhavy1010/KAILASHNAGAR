const Student = require("../models/Student");
const crypto = require("crypto");
const { checkTeacherPermission } = require("../services/teacherPermission.service");
const { canManageStudent, canAccessClass, isAdmin } = require("../services/authorization.service");

const generateTemporaryPassword = () => {
    return crypto.randomBytes(8).toString("hex");
};

// ======================================================
// Ownership check: teachers can only access students in
// their assigned classes. Admins bypass this check.
// ======================================================

const ensureStudentAccess = async (student, req) => {
    if (!req.user) {
        return { authorized: false, message: "Unauthorized" };
    }

    if (isAdmin(req.user)) {
        return { authorized: true };
    }

    if (req.user.role === "teacher") {
        const authorized = await canAccessClass(req.user, student.standard, student.division);
        if (!authorized) {
            return {
                authorized: false,
                message: "Access Denied: You can only view students from your assigned classes."
            };
        }
    }

    return { authorized: true };
};

const createStudent = async (req, res) => {
    try {
        const {
            grNumber,
            fullName,
            fatherName,
            motherName,
            gender,
            dateOfBirth,
            parentMobile,
            standard,
            division,
            address,
            admissionDate,
            status,
            photo
        } = req.body;

        if (
            !grNumber ||
            !fullName ||
            !fatherName ||
            !motherName ||
            !gender ||
            !dateOfBirth ||
            !parentMobile ||
            !standard ||
            !division ||
            !address
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields are mandatory."
            });
        }

        const existingStudent = await Student.findOne({
            grNumber: grNumber.trim()
        });

        if (existingStudent) {
            return res.status(400).json({
                success: false,
                message: "Student already exists with this GR Number."
            });
        }

        const temporaryPassword = generateTemporaryPassword();

        const student = await Student.create({
            grNumber: grNumber.trim(),
            fullName: fullName.trim(),
            fatherName: fatherName.trim(),
            motherName: motherName.trim(),
            gender,
            dateOfBirth,
            parentMobile: parentMobile.trim(),
            password: temporaryPassword,
            standard: Number(standard),
            division: division.trim().toUpperCase(),
            address: address.trim(),
            admissionDate: admissionDate || new Date(),
            status: status || "Active",
            photo: photo || "",
            mustResetPassword: true
        });

        res.status(201).json({
            success: true,
            message: "Student created successfully. A secure temporary password has been generated.",
            student: {
                id: student._id,
                grNumber: student.grNumber,
                fullName: student.fullName,
                standard: student.standard,
                division: student.division,
                temporaryPassword
            }
        });
    } catch (error) {
        console.error("Create student error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Unable to create student."
        });
    }
};

const getAllStudents = async (req, res) => {
    try {
        const filter = {};

        if (req.user?.role === "teacher" && !isAdmin(req.user)) {
            const teacher = await require("../models/Teacher").findById(req.user.id).select("classesHandled");
            if (teacher && teacher.classesHandled && teacher.classesHandled.length > 0) {
                const classIds = [];
                for (const ch of teacher.classesHandled) {
                    const parts = String(ch).trim().toLowerCase().replace(/std|class/gi, "").trim().split(/[\s-]+/);
                    const stdNum = parseInt(parts[0], 10);
                    const div = parts[1] || "";
                    if (!isNaN(stdNum) && div) {
                        const classDoc = await require("../models/Class").findOne({ standard: stdNum, division: div });
                        if (classDoc) classIds.push(classDoc._id);
                    }
                }
                if (classIds.length > 0) {
                    const studentsInClasses = [];
                    for (const cid of classIds) {
                        const classDoc = await require("../models/Class").findById(cid);
                        if (classDoc) {
                            studentsInClasses.push(
                                ...(await Student.find({ standard: classDoc.standard, division: classDoc.division }).select("_id"))
                            );
                        }
                    }
                    const studentIds = studentsInClasses.map(s => s._id);
                    filter._id = { $in: studentIds };
                } else {
                    filter._id = { $in: [] };
                }
            }
        }

        const students = await Student.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: students.length,
            students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        const access = await ensureStudentAccess(student, req);

        if (!access.authorized) {
            return res.status(403).json({
                success: false,
                message: access.message
            });
        }

        res.status(200).json({
            success: true,
            student
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getStudentByGR = async (req, res) => {
    try {
        const student = await Student.findOne({
            grNumber: req.params.grNumber
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        const access = await ensureStudentAccess(student, req);

        if (!access.authorized) {
            return res.status(403).json({
                success: false,
                message: access.message
            });
        }

        res.status(200).json({
            success: true,
            student
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getStudentByName = async (req, res) => {
    try {
        const rawName = String(req.params.fullName || "").trim();
        const escaped = rawName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const keyword = escaped || ".";

        const filter = { fullName: { $regex: keyword, $options: "i" } };

        if (req.user?.role === "teacher" && !isAdmin(req.user)) {
            const teacher = await require("../models/Teacher").findById(req.user.id).select("classesHandled");
            if (teacher && teacher.classesHandled && teacher.classesHandled.length > 0) {
                const classIds = [];
                for (const ch of teacher.classesHandled) {
                    const parts = String(ch).trim().toLowerCase().replace(/std|class/gi, "").trim().split(/[\s-]+/);
                    const stdNum = parseInt(parts[0], 10);
                    const div = parts[1] || "";
                    if (!isNaN(stdNum) && div) {
                        const classDoc = await require("../models/Class").findOne({ standard: stdNum, division: div });
                        if (classDoc) classIds.push(classDoc._id);
                    }
                }
                if (classIds.length > 0) {
                    const studentsInClasses = [];
                    for (const cid of classIds) {
                        const classDoc = await require("../models/Class").findById(cid);
                        if (classDoc) {
                            studentsInClasses.push(
                                ...(await Student.find({ standard: classDoc.standard, division: classDoc.division }).select("_id"))
                            );
                        }
                    }
                    const studentIds = studentsInClasses.map(s => s._id);
                    filter._id = { $in: studentIds };
                } else {
                    filter._id = { $in: [] };
                }
            } else {
                filter._id = { $in: [] };
            }
        }

        const students = await Student.find(filter).sort({ fullName: 1 });

        res.status(200).json({
            success: true,
            count: students.length,
            students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const searchStudents = async (req, res) => {
    try {
        const rawKeyword = String(req.query.keyword || "").trim();
        const escaped = rawKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const keyword = escaped || ".";

        const baseFilter = {
            $or: [
                { fullName: { $regex: keyword, $options: "i" } },
                { grNumber: { $regex: keyword, $options: "i" } },
                { parentMobile: { $regex: keyword, $options: "i" } }
            ]
        };

        let filter = baseFilter;

        if (req.user?.role === "teacher" && !isAdmin(req.user)) {
            const teacher = await require("../models/Teacher").findById(req.user.id).select("classesHandled");
            if (teacher && teacher.classesHandled && teacher.classesHandled.length > 0) {
                const classIds = [];
                for (const ch of teacher.classesHandled) {
                    const parts = String(ch).trim().toLowerCase().replace(/std|class/gi, "").trim().split(/[\s-]+/);
                    const stdNum = parseInt(parts[0], 10);
                    const div = parts[1] || "";
                    if (!isNaN(stdNum) && div) {
                        const classDoc = await require("../models/Class").findOne({ standard: stdNum, division: div });
                        if (classDoc) classIds.push(classDoc._id);
                    }
                }
                if (classIds.length > 0) {
                    const studentsInClasses = [];
                    for (const cid of classIds) {
                        const classDoc = await require("../models/Class").findById(cid);
                        if (classDoc) {
                            studentsInClasses.push(
                                ...(await Student.find({ standard: classDoc.standard, division: classDoc.division }).select("_id"))
                            );
                        }
                    }
                    const studentIds = studentsInClasses.map(s => s._id);
                    filter = {
                        _id: { $in: studentIds },
                        ...baseFilter
                    };
                } else {
                    filter = { _id: { $in: [] } };
                }
            } else {
                filter = { _id: { $in: [] } };
            }
        }

        const students = await Student.find(filter).sort({ fullName: 1 });

        res.status(200).json({
            success: true,
            count: students.length,
            students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getStudentsPagination = async (req, res) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const filter = {};

        if (req.user?.role === "teacher" && !isAdmin(req.user)) {
            const teacher = await require("../models/Teacher").findById(req.user.id).select("classesHandled");
            if (teacher && teacher.classesHandled && teacher.classesHandled.length > 0) {
                const classIds = [];
                for (const ch of teacher.classesHandled) {
                    const parts = String(ch).trim().toLowerCase().replace(/std|class/gi, "").trim().split(/[\s-]+/);
                    const stdNum = parseInt(parts[0], 10);
                    const div = parts[1] || "";
                    if (!isNaN(stdNum) && div) {
                        const classDoc = await require("../models/Class").findOne({ standard: stdNum, division: div });
                        if (classDoc) classIds.push(classDoc._id);
                    }
                }
                if (classIds.length > 0) {
                    const studentsInClasses = [];
                    for (const cid of classIds) {
                        const classDoc = await require("../models/Class").findById(cid);
                        if (classDoc) {
                            studentsInClasses.push(
                                ...(await Student.find({ standard: classDoc.standard, division: classDoc.division }).select("_id"))
                            );
                        }
                    }
                    const studentIds = studentsInClasses.map(s => s._id);
                    filter._id = { $in: studentIds };
                } else {
                    filter._id = { $in: [] };
                }
            } else {
                filter._id = { $in: [] };
            }
        }

        const [totalStudents, students] = await Promise.all([
            Student.countDocuments(filter),
            Student.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
        ]);

        res.status(200).json({
            success: true,
            currentPage: page,
            totalPages: Math.ceil(totalStudents / limit),
            totalStudents,
            students
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        const access = await ensureStudentAccess(student, req);

        if (!access.authorized) {
            return res.status(403).json({
                success: false,
                message: access.message
            });
        }

        if (
            req.body.grNumber &&
            req.body.grNumber.trim() !== student.grNumber
        ) {
            const existingStudent = await Student.findOne({
                grNumber: req.body.grNumber.trim()
            });

            if (existingStudent) {
                return res.status(400).json({
                    success: false,
                    message: "GR Number already exists."
                });
            }
        }

        if (req.body.dateOfBirth) {
            student.dateOfBirth = req.body.dateOfBirth;
        }

        student.grNumber = req.body.grNumber?.trim() || student.grNumber;
        student.fullName = req.body.fullName?.trim() || student.fullName;
        student.fatherName =
            req.body.fatherName?.trim() || student.fatherName;
        student.motherName =
            req.body.motherName?.trim() || student.motherName;
        student.gender = req.body.gender || student.gender;
        student.parentMobile =
            req.body.parentMobile?.trim() || student.parentMobile;
        student.standard =
            Number(req.body.standard) || student.standard;
        student.division =
            req.body.division?.trim().toUpperCase() || student.division;
        student.address = req.body.address?.trim() || student.address;
        student.admissionDate =
            req.body.admissionDate || student.admissionDate;
        student.status = req.body.status || student.status;
        student.photo = req.body.photo || student.photo;

        await student.save();

        res.status(200).json({
            success: true,
            message: "Student updated successfully.",
            student
        });
    } catch (error) {
        console.error("Update student error:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Unable to update student."
        });
    }
};

const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        const access = await ensureStudentAccess(student, req);

        if (!access.authorized) {
            return res.status(403).json({
                success: false,
                message: access.message
            });
        }

        await student.deleteOne();

        res.status(200).json({
            success: true,
            message: "Student deleted successfully."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createStudent,
    getAllStudents,
    getStudentById,
    getStudentByGR,
    getStudentByName,
    searchStudents,
    updateStudent,
    deleteStudent,
    getStudentsPagination
};