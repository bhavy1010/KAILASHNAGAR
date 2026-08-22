import api from "../config/axios";

export const getStudentRisk = async (studentId) => {
    const response = await api.get(`/student-risk/${studentId}`);
    return response.data;
};

export const getClassRisk = async (standard, division) => {
    const response = await api.get(`/student-risk/class/${standard}/${division}`);
    return response.data;
};

export const getRiskDashboard = async () => {
    const response = await api.get(`/student-risk/dashboard`);
    return response.data;
};
