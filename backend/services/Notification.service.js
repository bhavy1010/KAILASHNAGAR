const Notification = require("../models/Notification");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

// ======================================================
// notifyUser
// Send one notification to one specific user.
// Never throws — a notification failing to send should
// never break the actual action (e.g. a leave getting
// approved must succeed even if this insert fails).
// ======================================================

const notifyUser = async ({ userId, userRole, title, message, type = "general", link = "" }) => {

    try {

        await Notification.create({
            userId,
            userRole,
            title,
            message,
            type,
            link
        });

    } catch (error) {

        console.log("NOTIFY USER ERROR:", error.message);

    }

};

// ======================================================
// notifyStudentsByClass
// Send the same notification to every student in a
// standard + division (used for "new homework assigned").
// ======================================================

const notifyStudentsByClass = async ({ standard, division, title, message, type = "general", link = "" }) => {

    try {

        const students = await Student.find(
            { standard, division, status: "Active" },
            "_id"
        );

        if (students.length === 0) return;

        const docs = students.map((student) => ({
            userId: student._id,
            userRole: "student",
            title,
            message,
            type,
            link
        }));

        await Notification.insertMany(docs);

    } catch (error) {

        console.log("NOTIFY STUDENTS BY CLASS ERROR:", error.message);

    }

};

// ======================================================
// notifyAudience
// Send the same notification to a Notice-style audience —
// "All", "Teachers", "Students". ("Parents" is skipped: this
// app has no separate parent login, so there's no inbox to
// deliver to.)
// ======================================================

const notifyAudience = async ({ audience, title, message, type = "notice", link = "" }) => {

    try {

        const docs = [];

        if (audience === "All" || audience === "Students") {

            const students = await Student.find({ status: "Active" }, "_id");

            students.forEach((student) => docs.push({
                userId: student._id,
                userRole: "student",
                title,
                message,
                type,
                link
            }));

        }

        if (audience === "All" || audience === "Teachers") {

            const teachers = await Teacher.find({ status: "Active" }, "_id");

            teachers.forEach((teacher) => docs.push({
                userId: teacher._id,
                userRole: "teacher",
                title,
                message,
                type,
                link
            }));

        }

        if (docs.length === 0) return;

        await Notification.insertMany(docs);

    } catch (error) {

        console.log("NOTIFY AUDIENCE ERROR:", error.message);

    }

};

module.exports = {
    notifyUser,
    notifyStudentsByClass,
    notifyAudience
};