// ======================================================
// Upload Service
// ======================================================

import api from "../config/axios";

// ======================================================
// Upload Student Photo
// ======================================================

export const uploadStudentPhoto = async (

    studentId,

    photo

) => {

    const formData = new FormData();

    formData.append(

        "photo",

        photo

    );

    const response = await api.post(

        `/upload/student-photo/${studentId}`,

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
// Delete Student Photo (Future)
// ======================================================

export const deleteStudentPhoto = async (

    studentId

) => {

    const response = await api.delete(

        `/upload/student-photo/${studentId}`

    );

    return response.data;

};

// ======================================================
// Upload Teacher Photo
// ======================================================

export const uploadTeacherPhoto = async (

    teacherId,

    photo

) => {

    const formData = new FormData();

    formData.append(

        "photo",

        photo

    );

    const response = await api.post(

        `/upload/teacher-photo/${teacherId}`,

        formData,

        {

            headers: {

                "Content-Type": "multipart/form-data"

            }

        }

    );

    return response.data;

};