const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Student = require("../models/Student");
const Class = require("../models/Class");
const Homework = require("../models/Homework");
const Quiz = require("../models/Quiz");
const HomeworkSubmission = require("../models/HomeworkSubmission");

const isAdmin = (user) => {
    return user && user.role && user.role.toLowerCase() === "admin";
};

const isTeacher = (user) => {
    return user && user.role && user.role.toLowerCase() === "teacher";
};

const isStudent = (user) => {
    return user && user.role && user.role.toLowerCase() === "student";
};

const getTeacherRecord = async (teacherId) => {
    return await Teacher.findById(teacherId).select("subject subjectsHandled classesHandled");
};

const getClassRecord = async (classId) => {
    return await Class.findById(classId).select("standard division classTeacher");
};

const isClassTeacherOf = async (teacherId, standard, division) => {
    const matchingClass = await Class.findOne({
        standard,
        division,
        classTeacher: teacherId
    });
    return Boolean(matchingClass);
};

const isSubjectTeacher = async (teacherId, subjectName, standard, division) => {
    const teacher = await getTeacherRecord(teacherId);
    if (!teacher) return false;

    const reqSubject = (subjectName || "").trim().toLowerCase();
    const assignedSubjects = [
        teacher.subject,
        ...(teacher.subjectsHandled || [])
    ]
        .filter(Boolean)
        .map((s) => s.trim().toLowerCase());

    if (assignedSubjects.length > 0) {
        const hasSubject = assignedSubjects.some((s) => {
            return (
                s === reqSubject ||
                reqSubject.includes(s) ||
                s.includes(reqSubject)
            );
        });
        if (!hasSubject) return false;
    }

    if (standard !== undefined && standard !== null && division !== undefined && division !== null) {
        const reqStdNum = parseInt(standard, 10);
        const reqStdStr = String(standard).trim().toLowerCase();
        const reqDivStr = String(division).trim().toLowerCase();

        const isFormalClassTeacher = await isClassTeacherOf(teacherId, reqStdNum || standard, division);

        const handledClasses = (teacher.classesHandled || []).map((c) =>
            c.toString().trim().toLowerCase()
        );

        if (handledClasses.length > 0) {
            const isAuthorizedClass =
                isFormalClassTeacher ||
                handledClasses.some((c) => {
                    const cleanC = c.replace(/std|class/gi, "").trim();
                    return (
                        c === reqStdStr ||
                        c.includes(reqStdStr) ||
                        cleanC === reqStdStr ||
                        (reqDivStr && c.includes(reqDivStr))
                    );
                });
            if (!isAuthorizedClass) return false;
        }
    }

    return true;
};

const canAccessClass = async (user, standard, division) => {
    if (isAdmin(user)) return true;

    if (isTeacher(user)) {
        const teacher = await getTeacherRecord(user.id);
        if (!teacher) return false;

        const reqStdNum = parseInt(standard, 10);
        const reqStdStr = String(standard).trim().toLowerCase();
        const reqDivStr = String(division).trim().toLowerCase();

        const isFormalClassTeacher = await isClassTeacherOf(user.id, reqStdNum || standard, division);

        const handledClasses = (teacher.classesHandled || []).map((c) =>
            c.toString().trim().toLowerCase()
        );

        if (handledClasses.length > 0) {
            return isFormalClassTeacher || handledClasses.some((c) => {
                const cleanC = c.replace(/std|class/gi, "").trim();
                return (
                    c === reqStdStr ||
                    c.includes(reqStdStr) ||
                    cleanC === reqStdStr ||
                    (reqDivStr && c.includes(reqDivStr))
                );
            });
        }

        return isFormalClassTeacher;
    }

    return false;
};

const canAccessSubject = async (user, subjectName, standard, division) => {
    if (isAdmin(user)) return true;

    if (isTeacher(user)) {
        return await isSubjectTeacher(user.id, subjectName, standard, division);
    }

    return false;
};

const canManageStudent = async (user, studentId) => {
    if (isAdmin(user)) return true;

    const student = await Student.findById(studentId);
    if (!student) return false;

    if (isStudent(user)) {
        return user.id.toString() === studentId.toString();
    }

    if (isTeacher(user)) {
        return await canAccessClass(user, student.standard, student.division);
    }

    return false;
};

const canManageHomework = async (user, homeworkId) => {
    if (isAdmin(user)) return true;

    const homework = await Homework.findById(homeworkId);
    if (!homework) return false;

    if (isTeacher(user)) {
        const teacher = await getTeacherRecord(user.id);
        if (!teacher) return false;

        const assignedSubjects = [
            teacher.subject,
            ...(teacher.subjectsHandled || [])
        ]
            .filter(Boolean)
            .map((s) => s.trim().toLowerCase());

        const reqSubject = (homework.subject || "").trim().toLowerCase();
        const hasSubject = assignedSubjects.some((s) => {
            return (
                s === reqSubject ||
                reqSubject.includes(s) ||
                s.includes(reqSubject)
            );
        });

        if (!hasSubject) return false;

        const isFormalClassTeacher = await isClassTeacherOf(
            user.id,
            homework.standard,
            homework.division
        );

        const handledClasses = (teacher.classesHandled || []).map((c) =>
            c.toString().trim().toLowerCase()
        );

        const reqStdStr = String(homework.standard).trim().toLowerCase();
        const reqDivStr = String(homework.division).trim().toLowerCase();

        if (handledClasses.length > 0) {
            return isFormalClassTeacher || handledClasses.some((c) => {
                const cleanC = c.replace(/std|class/gi, "").trim();
                return (
                    c === reqStdStr ||
                    c.includes(reqStdStr) ||
                    cleanC === reqStdStr ||
                    (reqDivStr && c.includes(reqDivStr))
                );
            });
        }

        return isFormalClassTeacher;
    }

    return false;
};

const canManageQuiz = async (user, quizId) => {
    if (isAdmin(user)) return true;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return false;

    if (isTeacher(user)) {
        const teacher = await getTeacherRecord(user.id);
        if (!teacher) return false;

        const assignedSubjects = [
            teacher.subject,
            ...(teacher.subjectsHandled || [])
        ]
            .filter(Boolean)
            .map((s) => s.trim().toLowerCase());

        const reqSubject = (quiz.subject || "").trim().toLowerCase();
        const hasSubject = assignedSubjects.some((s) => {
            return (
                s === reqSubject ||
                reqSubject.includes(s) ||
                s.includes(reqSubject)
            );
        });

        if (!hasSubject) return false;

        const isFormalClassTeacher = await isClassTeacherOf(
            user.id,
            quiz.standard,
            ""
        );

        const handledClasses = (teacher.classesHandled || []).map((c) =>
            c.toString().trim().toLowerCase()
        );

        const reqStdStr = String(quiz.standard).trim().toLowerCase();

        if (handledClasses.length > 0) {
            return isFormalClassTeacher || handledClasses.some((c) => {
                const cleanC = c.replace(/std|class/gi, "").trim();
                return (
                    c === reqStdStr ||
                    c.includes(reqStdStr) ||
                    cleanC === reqStdStr
                );
            });
        }

        return isFormalClassTeacher;
    }

    return false;
};

const canManageAttendance = async (user, standard, division) => {
    if (isAdmin(user)) return true;

    if (isTeacher(user)) {
        const authorized = await isClassTeacherOf(user.id, standard, division);
        if (authorized) return true;

        const teacher = await getTeacherRecord(user.id);
        if (!teacher) return false;

        const reqStdStr = String(standard).trim().toLowerCase();
        const reqDivStr = String(division).trim().toLowerCase();

        const handledClasses = (teacher.classesHandled || []).map((c) =>
            c.toString().trim().toLowerCase()
        );

        if (handledClasses.length > 0) {
            return handledClasses.some((c) => {
                const cleanC = c.replace(/std|class/gi, "").trim();
                return (
                    c === reqStdStr ||
                    c.includes(reqStdStr) ||
                    cleanC === reqStdStr ||
                    (reqDivStr && c.includes(reqDivStr))
                );
            });
        }

        return false;
    }

    return false;
};

const canViewSubmission = async (user, submission) => {
    if (isAdmin(user)) return true;

    if (isStudent(user)) {
        const submissionDoc = submission instanceof HomeworkSubmission
            ? submission
            : await HomeworkSubmission.findById(submission._id || submission);
        if (!submissionDoc) return false;
        return user.id.toString() === submissionDoc.studentId.toString();
    }

    if (isTeacher(user)) {
        const submissionDoc = submission instanceof HomeworkSubmission
            ? submission
            : await HomeworkSubmission.findById(submission._id || submission)
                .populate("homeworkId", "subject standard division");
        if (!submissionDoc || !submissionDoc.homeworkId) return false;

        const hw = submissionDoc.homeworkId;
        return await canAccessSubject(user, hw.subject, hw.standard, hw.division);
    }

    return false;
};

const canGradeSubmission = async (user, submissionId) => {
    if (isAdmin(user)) return true;

    const submission = await HomeworkSubmission.findById(submissionId)
        .populate("homeworkId", "subject standard division");

    if (!submission || !submission.homeworkId) return false;

    if (isTeacher(user)) {
        const hw = submission.homeworkId;
        const teacher = await getTeacherRecord(user.id);
        if (!teacher) return false;

        const assignedSubjects = [
            teacher.subject,
            ...(teacher.subjectsHandled || [])
        ]
            .filter(Boolean)
            .map((s) => s.trim().toLowerCase());

        const reqSubject = (hw.subject || "").trim().toLowerCase();
        const hasSubject = assignedSubjects.some((s) => {
            return (
                s === reqSubject ||
                reqSubject.includes(s) ||
                s.includes(reqSubject)
            );
        });

        if (!hasSubject) return false;

        const isFormalClassTeacher = await isClassTeacherOf(
            user.id,
            hw.standard,
            hw.division
        );

        const handledClasses = (teacher.classesHandled || []).map((c) =>
            c.toString().trim().toLowerCase()
        );

        const reqStdStr = String(hw.standard).trim().toLowerCase();
        const reqDivStr = String(hw.division).trim().toLowerCase();

        if (handledClasses.length > 0) {
            return isFormalClassTeacher || handledClasses.some((c) => {
                const cleanC = c.replace(/std|class/gi, "").trim();
                return (
                    c === reqStdStr ||
                    c.includes(reqStdStr) ||
                    cleanC === reqStdStr ||
                    (reqDivStr && c.includes(reqDivStr))
                );
            });
        }

        return isFormalClassTeacher;
    }

    return false;
};

const canManageResult = async (user, resultOrExamId) => {
    if (isAdmin(user)) return true;

    if (isTeacher(user)) {
        let examId = resultOrExamId;
        if (typeof resultOrExamId === "string" && resultOrExamId.startsWith("result-")) {
            const Result = require("../models/Result");
            const result = await Result.findById(resultOrExamId);
            if (result) examId = result.examId;
        }

        if (typeof examId === "string") {
            const Exam = require("../models/Exam");
            const exam = await Exam.findById(examId);
            if (!exam) return false;
            return await canAccessClass(user, exam.standard, exam.division);
        }

        const Exam = require("../models/Exam");
        const exam = await Exam.findById(examId._id || examId);
        if (!exam) return false;
        return await canAccessClass(user, exam.standard, exam.division);
    }

    return false;
};

const getClassIdFromStandardDivision = async (standard, division) => {
    const classDoc = await Class.findOne({
        standard: Number(standard),
        division: String(division).trim()
    });
    return classDoc ? classDoc._id : null;
};

const canUploadStudentPhoto = async (user, studentId) => {
    if (isAdmin(user)) return true;

    const student = await Student.findById(studentId);
    if (!student) return false;

    if (isStudent(user)) {
        return user.id.toString() === studentId.toString();
    }

    if (isTeacher(user)) {
        return await canAccessClass(user, student.standard, student.division);
    }

    return false;
};

const canUploadTeacherPhoto = async (user, teacherId) => {
    if (isAdmin(user)) return true;

    if (isTeacher(user)) {
        return user.id.toString() === teacherId.toString();
    }

    return false;
};

const canDeleteHomework = async (user, homeworkId) => {
    if (isAdmin(user)) return true;

    if (isTeacher(user)) {
        const homework = await Homework.findById(homeworkId);
        if (!homework) return false;

        const teacher = await getTeacherRecord(user.id);
        if (!teacher) return false;

        const assignedSubjects = [
            teacher.subject,
            ...(teacher.subjectsHandled || [])
        ]
            .filter(Boolean)
            .map((s) => s.trim().toLowerCase());

        const reqSubject = (homework.subject || "").trim().toLowerCase();
        const hasSubject = assignedSubjects.some((s) => {
            return (
                s === reqSubject ||
                reqSubject.includes(s) ||
                s.includes(reqSubject)
            );
        });

        if (!hasSubject) return false;

        const isFormalClassTeacher = await isClassTeacherOf(
            user.id,
            homework.standard,
            homework.division
        );

        const handledClasses = (teacher.classesHandled || []).map((c) =>
            c.toString().trim().toLowerCase()
        );

        const reqStdStr = String(homework.standard).trim().toLowerCase();
        const reqDivStr = String(homework.division).trim().toLowerCase();

        if (handledClasses.length > 0) {
            return isFormalClassTeacher || handledClasses.some((c) => {
                const cleanC = c.replace(/std|class/gi, "").trim();
                return (
                    c === reqStdStr ||
                    c.includes(reqStdStr) ||
                    cleanC === reqStdStr ||
                    (reqDivStr && c.includes(reqDivStr))
                );
            });
        }

        return isFormalClassTeacher;
    }

    return false;
};

module.exports = {
    isAdmin,
    isTeacher,
    isStudent,
    isClassTeacherOf,
    isSubjectTeacher,
    canAccessClass,
    canAccessSubject,
    canManageStudent,
    canManageHomework,
    canManageQuiz,
    canManageAttendance,
    canViewSubmission,
    canGradeSubmission,
    canManageResult,
    canUploadStudentPhoto,
    canUploadTeacherPhoto,
    canDeleteHomework,
    getClassIdFromStandardDivision,
    getTeacherRecord
};
