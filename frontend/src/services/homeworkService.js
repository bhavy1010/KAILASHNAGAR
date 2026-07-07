import api from "../config/axios";

// ======================================================
// Get All Homework (filterable)
// ======================================================

export const getAllHomework = async (filters = {}) => {

    const params = new URLSearchParams(

        Object.entries(filters).filter(

            ([, value]) => value !== "" && value !== undefined

        )

    );

    const response = await api.get(

        `/homework/all?${params.toString()}`

    );

    return response.data;

};

// ======================================================
// Get Homework By ID
// ======================================================

export const getHomeworkById = async (id) => {

    const response = await api.get(

        `/homework/${id}`

    );

    return response.data;

};

// ======================================================
// Get Homework By Class
// ======================================================

export const getHomeworkByClass = async (classId) => {

    const response = await api.get(

        `/homework/class/${classId}`

    );

    return response.data;

};

// ======================================================
// Get Homework For Student
// ======================================================

export const getHomeworkForStudent = async (studentId) => {

    const response = await api.get(

        `/homework/student/${studentId}`

    );

    return response.data;

};

// ======================================================
// Create Homework (with optional file attachment)
// ======================================================

export const createHomework = async (formData) => {

    const response = await api.post(

        "/homework/add",

        formData,

        {

            headers: {

                "Content-Type": "multipart/form-data"

            }

        }

    );

    return response.data;

};

// ======================================================
// Update Homework (with optional file attachment)
// ======================================================

export const updateHomework = async (id, formData) => {

    const response = await api.put(

        `/homework/${id}`,

        formData,

        {

            headers: {

                "Content-Type": "multipart/form-data"

            }

        }

    );

    return response.data;

};

// ======================================================
// Delete Homework
// ======================================================

export const deleteHomework = async (id) => {

    const response = await api.delete(

        `/homework/${id}`

    );

    return response.data;

};

// ======================================================
// Dashboard Stats
// ======================================================

export const getHomeworkDashboard = async () => {

    const response = await api.get(

        "/homework/dashboard"

    );

    return response.data;

};