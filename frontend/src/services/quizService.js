import api from "../config/axios";

export const getQuizzes = async (filters = {}) => {
    const params = new URLSearchParams(
        Object.entries(filters).filter(([, val]) => val !== "" && val !== undefined && val !== null)
    );
    const response = await api.get(`/quiz?${params.toString()}`);
    return response.data;
};

export const getQuizById = async (id) => {
    const response = await api.get(`/quiz/${id}`);
    return response.data;
};

export const createManualQuiz = async (quizData) => {
    const response = await api.post("/quiz/manual", quizData);
    return response.data;
};

export const createAutoQuiz = async (quizData) => {
    const response = await api.post("/quiz/auto", quizData);
    return response.data;
};

export const toggleQuizPublish = async (id) => {
    const response = await api.put(`/quiz/${id}/status`);
    return response.data;
};

export const updateQuiz = async (id, quizData) => {
    const response = await api.put(`/quiz/${id}`, quizData);
    return response.data;
};

export const deleteQuiz = async (id) => {
    const response = await api.delete(`/quiz/${id}`);
    return response.data;
};

export const startQuizAttempt = async (quizId) => {
    const response = await api.post(`/quiz/${quizId}/start`);
    return response.data;
};

export const saveQuizAnswer = async (attemptId, answerData) => {
    const response = await api.put(`/quiz/attempt/${attemptId}/save-answer`, answerData);
    return response.data;
};

export const submitQuizAttempt = async (attemptId, submissionData) => {
    const response = await api.post(`/quiz/attempt/${attemptId}/submit`, submissionData);
    return response.data;
};

export const getStudentAttempts = async (quizId = "") => {
    const response = await api.get(`/quiz/results/my${quizId ? `?quizId=${quizId}` : ""}`);
    return response.data;
};

export const getAttemptById = async (attemptId) => {
    const response = await api.get(`/quiz/attempt/detail/${attemptId}`);
    return response.data;
};

export const getQuizLeaderboard = async (quizId) => {
    const response = await api.get(`/quiz/${quizId}/rank`);
    return response.data;
};

export const getQuizAnalytics = async (filters = {}) => {
    const params = new URLSearchParams(
        Object.entries(filters).filter(([, val]) => val !== "" && val !== undefined)
    );
    const response = await api.get(`/quiz/analytics?${params.toString()}`);
    return response.data;
};
