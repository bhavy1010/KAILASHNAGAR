import api from "../config/axios";

export const getTimetable = async (classId) => (await api.get(`/timetable/class/${classId}`)).data;
export const createTimetable = async (data) => (await api.post("/timetable/add", data)).data;
export const updateTimetable = async (id, data) => (await api.put(`/timetable/${id}`, data)).data;
export const deleteTimetable = async (id) => (await api.delete(`/timetable/${id}`)).data;
