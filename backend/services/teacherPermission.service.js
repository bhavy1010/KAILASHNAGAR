const Teacher = require("../models/Teacher");
const Class = require("../models/Class");

/**
 * Validates whether a logged-in teacher is authorized for a specific subject and/or class standard.
 * Admins are automatically authorized for all subjects and classes.
 *
 * @param {Object} params
 * @param {string} params.teacherId  - req.user.id
 * @param {string} params.role       - req.user.role
 * @param {string} [params.subject]  - subject name e.g. "Mathematics"
 * @param {number|string} [params.standard] - class standard e.g. 8 or "Std 8" or "8"
 * @param {string} [params.division] - division e.g. "A"
 */
const checkTeacherPermission = async ({ teacherId, role, subject, standard, division }) => {
    // Admin has full access to everything
    if (!role || role.toLowerCase() === "admin") {
        return { authorized: true };
    }

    // Only teachers are subject/class restricted
    if (role.toLowerCase() !== "teacher") {
        return { authorized: true };
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
        return {
            authorized: false,
            message: "Teacher account record not found."
        };
    }

    // ======================================================
    // 1. Subject Permission Check
    // ======================================================
    if (subject && typeof subject === "string" && subject.trim()) {
        const reqSubject = subject.trim().toLowerCase();

        // Collect all assigned subjects for this teacher
        const assignedSubjects = [
            teacher.subject,
            ...(teacher.subjectsHandled || [])
        ]
            .filter(Boolean)
            .map((s) => s.trim().toLowerCase());

        if (assignedSubjects.length > 0) {
            const isAuthorizedSubject = assignedSubjects.some((s) => {
                return (
                    s === reqSubject ||
                    reqSubject.includes(s) ||
                    s.includes(reqSubject)
                );
            });

            if (!isAuthorizedSubject) {
                const displaySubjects = [
                    ...new Set(
                        [teacher.subject, ...(teacher.subjectsHandled || [])].filter(
                            Boolean
                        )
                    )
                ].join(", ");

                return {
                    authorized: false,
                    message: `Access Denied: You are only authorized to manage content for your assigned subject(s): [${displaySubjects}].`
                };
            }
        }
    }

    // ======================================================
    // 2. Class / Standard Permission Check
    // ======================================================
    if (standard !== undefined && standard !== null && standard !== "") {
        const reqStdNum = parseInt(standard, 10);
        const reqStdStr = standard.toString().trim().toLowerCase();
        const reqDivStr = division ? division.toString().trim().toLowerCase() : "";

        // Check if formally assigned as Class Teacher in Class model
        let isClassTeacher = false;
        if (division) {
            const matchingClass = await Class.findOne({
                standard: reqStdNum || standard,
                division: division,
                classTeacher: teacherId
            });
            isClassTeacher = Boolean(matchingClass);
        }

        // Check classesHandled array in Teacher model
        const handledClasses = (teacher.classesHandled || []).map((c) =>
            c.toString().trim().toLowerCase()
        );

        if (handledClasses.length > 0) {
            const isAuthorizedClass =
                isClassTeacher ||
                handledClasses.some((c) => {
                    const cleanC = c.replace(/std|class/gi, "").trim();
                    return (
                        c === reqStdStr ||
                        c.includes(reqStdStr) ||
                        cleanC === reqStdStr ||
                        (reqDivStr && c.includes(reqDivStr))
                    );
                });

            if (!isAuthorizedClass) {
                const displayClasses = teacher.classesHandled.join(", ");
                return {
                    authorized: false,
                    message: `Access Denied: You are only authorized to manage content for your assigned class(es): [${displayClasses}].`
                };
            }
        }
    }

    return { authorized: true };
};

module.exports = {
    checkTeacherPermission
};
