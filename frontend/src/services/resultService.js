import api from "../config/axios";

export const saveResult = async (resultData) => {

    const response = await api.post("/results/save", resultData);

    return response.data;

};

export const getClassResults = async (examId) => {

    const response = await api.get("/results/class/" + examId);

    return response.data;

};

export const getStudentResult = async (studentId, examId) => {

    const response = await api.get(

        "/results/student/" + studentId + "/exam/" + examId

    );

    return response.data;

};

export const getAllResultsForStudent = async (studentId) => {

    const response = await api.get("/results/student/" + studentId);

    return response.data;

};

export const getMarksEntryData = async (examId) => {

    const response = await api.get("/results/entry/" + examId);

    return response.data;

};

export const getResultAnalytics = async (filters = {}) => {

    const params = new URLSearchParams(

        Object.entries(filters).filter(

            ([, value]) => value !== "" && value !== undefined

        )

    );

    const response = await api.get("/results/analytics?" + params.toString());

    return response.data;

};