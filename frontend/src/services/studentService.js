// ======================================================
// Imports
// ======================================================

import api from "../config/axios";

// ======================================================
// Get All Students
// ======================================================

export const getStudents = async () => {

    const response = await api.get(

        "/students/all"

    );

    return response.data;

};

// ======================================================
// Get Students (Pagination)
// ======================================================

export const getStudentsPagination = async (

    page = 1,

    limit = 10

) => {

    const response = await api.get(

        `/students/pagination?page=${page}&limit=${limit}`

    );

    return response.data;

};

// ======================================================
// Search Students
// ======================================================

export const searchStudents = async (keyword) => {

    const response = await api.get(

        `/students/search?keyword=${keyword}`

    );

    return response.data;

};

// ======================================================
// Get Student By ID
// ======================================================

export const getStudentById = async (id) => {

    const response = await api.get(

        `/students/${id}`

    );

    return response.data;

};

// ======================================================
// Get Student By GR Number
// ======================================================

export const getStudentByGR = async (grNumber) => {

    const response = await api.get(

        `/students/gr/${grNumber}`

    );

    return response.data;

};

// ======================================================
// Add Student
// ======================================================

export const addStudent = async (studentData) => {

    const response = await api.post(

        "/students/add",

        studentData

    );

    return response.data;

};

// ======================================================
// Update Student
// ======================================================

export const updateStudent = async (

    id,

    studentData

) => {

    const response = await api.put(

        `/students/${id}`,

        studentData

    );

    return response.data;

};

// ======================================================
// Delete Student
// ======================================================

export const deleteStudent = async (id) => {

    const response = await api.delete(

        `/students/${id}`

    );

    return response.data;

};