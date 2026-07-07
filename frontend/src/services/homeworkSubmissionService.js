import api from "../config/axios";

// ======================================================
// Submit Homework (student — with optional file)
// ======================================================

export const submitHomework = async (submissionData) => {

    const response = await api.post(

        "/homework-submission/submit",

        submissionData,

        {

            headers: {

                "Content-Type": "multipart/form-data"

            }

        }

    );

    return response.data;

};

// ======================================================
// Get All Submissions For A Homework (teacher/admin)
// ======================================================

export const getSubmissionsByHomework = async (homeworkId) => {

    const response = await api.get(

        `/homework-submission/homework/${homeworkId}`

    );

    return response.data;

};

// ======================================================
// Get Student's Own Submissions
// ======================================================

export const getMySubmissions = async (studentId) => {

    const response = await api.get(

        `/homework-submission/student/${studentId}`

    );

    return response.data;

};

// ======================================================
// Get Single Submission By ID
// ======================================================

export const getSubmissionById = async (id) => {

    const response = await api.get(

        `/homework-submission/${id}`

    );

    return response.data;

};

// ======================================================
// Grade Submission (teacher/admin)
// ======================================================

export const gradeSubmission = async (id, gradeData) => {

    const response = await api.put(

        `/homework-submission/${id}/grade`,

        gradeData

    );

    return response.data;

};

// ======================================================
// Get Completion Stats For A Homework
// ======================================================

export const getHomeworkCompletion = async (homeworkId) => {

    const response = await api.get(

        `/homework-submission/completion/${homeworkId}`

    );

    return response.data;

};