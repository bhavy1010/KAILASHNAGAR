const Class = require("../models/Class");

// ======================================================
// Class Teacher Authorization
//
// A "class teacher" is whoever is set as Class.classTeacher
// for a given standard + division. This is deliberately
// narrower than "any teacher" — subject teachers who aren't
// the assigned class teacher for a class don't pass these
// checks, even though they may still teach that class.
//
// Scope (per school decision): attendance, leave approval,
// and notices are restricted to class teachers. Homework
// stays open to any teacher, so these helpers are only used
// in attendance/leave/notice controllers.
// ======================================================

// Is this teacher the assigned class teacher for this exact
// standard + division?

const isClassTeacherOf = async (teacherId, standard, division) => {

    const matchingClass = await Class.findOne({
        standard,
        division,
        classTeacher: teacherId
    });

    return Boolean(matchingClass);

};

// Is this teacher the assigned class teacher for ANY class at
// all? Used for school-wide actions (like posting a notice)
// that aren't tied to one specific standard/division.

const isClassTeacherOfAnyClass = async (teacherId) => {

    const matchingClass = await Class.findOne({
        classTeacher: teacherId
    });

    return Boolean(matchingClass);

};

module.exports = {
    isClassTeacherOf,
    isClassTeacherOfAnyClass
};