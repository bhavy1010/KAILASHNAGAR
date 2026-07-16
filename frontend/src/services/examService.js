import api from "../config/axios";

export const getAllExams = async (filters = {}) => {

    const params = new URLSearchParams(

        Object.entries(filters).filter(

            ([, value]) => value !== "" && value !== undefined

        )

    );

    const response = await api.get("/exams/all?" + params.toString());

    return response.data;

};

export const getExamById = async (id) => {

    const response = await api.get("/exams/" + id);

    return response.data;

};

export const createExam = async (examData) => {

    const response = await api.post("/exams/add", examData);

    return response.data;

};

export const updateExam = async (id, examData) => {

    const response = await api.put("/exams/" + id, examData);

    return response.data;

};

export const deleteExam = async (id) => {

    const response = await api.delete("/exams/" + id);

    return response.data;

};

export const getExamDashboard = async () => {

    const response = await api.get("/exams/dashboard");

    return response.data;

};