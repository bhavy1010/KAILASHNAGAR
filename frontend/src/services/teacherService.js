// ======================================================
// Imports
// ======================================================

import api from "../config/axios";

// ======================================================
// Get All Teachers
// ======================================================

export const getTeachers = async () => {

    const response = await api.get(

        "/teachers/all"

    );

    return response.data;

};

// ======================================================
// Get Teachers (Pagination)
// ======================================================

export const getTeachersPagination = async (

    page = 1,

    limit = 10

) => {

    const response = await api.get(

        `/teachers/pagination?page=${page}&limit=${limit}`

    );

    return response.data;

};

// ======================================================
// Search Teachers
// ======================================================

export const searchTeachers = async (keyword) => {

    const response = await api.get(

        `/teachers/search?keyword=${keyword}`

    );

    return response.data;

};

// ======================================================
// Get Teacher By ID
// ======================================================

export const getTeacherById = async (id) => {

    const response = await api.get(

        `/teachers/${id}`

    );

    return response.data;

};

// ======================================================
// Get Teacher By Mobile
// ======================================================

export const getTeacherByMobile = async (mobile) => {

    const response = await api.get(

        `/teachers/mobile/${mobile}`

    );

    return response.data;

};

// ======================================================
// Add Teacher
// ======================================================

export const addTeacher = async (teacherData) => {

    const response = await api.post(

        "/teachers/add",

        teacherData

    );

    return response.data;

};

// ======================================================
// Update Teacher
// ======================================================

export const updateTeacher = async (

    id,

    teacherData

) => {

    const response = await api.put(

        `/teachers/${id}`,

        teacherData

    );

    return response.data;

};

// ======================================================
// Delete Teacher
// ======================================================

export const deleteTeacher = async (id) => {

    const response = await api.delete(

        `/teachers/${id}`

    );

    return response.data;

};

// ======================================================
// Get My Teacher Scope (subjects & classes assigned to me)
// Used by teacher-role frontend to filter dropdowns
// ======================================================

export const getMyTeacherScope = async () => {
    const response = await api.get("/teachers/me/scope");
    return response.data;
};