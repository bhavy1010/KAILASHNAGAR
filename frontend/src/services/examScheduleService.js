import api from "../config/axios";

export const getScheduleByExam = async (examId) => {

    const response = await api.get("/exam-schedule/exam/" + examId);

    return response.data;

};

export const addSchedule = async (scheduleData) => {

    const response = await api.post("/exam-schedule/add", scheduleData);

    return response.data;

};

export const updateSchedule = async (id, scheduleData) => {

    const response = await api.put("/exam-schedule/" + id, scheduleData);

    return response.data;

};

export const deleteSchedule = async (id) => {

    const response = await api.delete("/exam-schedule/" + id);

    return response.data;

};