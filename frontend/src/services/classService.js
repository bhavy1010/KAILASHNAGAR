import api from "../config/axios";

export const getClasses = async () => {

  const response = await api.get("/classes/all");

  return response.data;

};

export const createClass = async (classData) => {

  const response = await api.post("/classes/add", classData);

  return response.data;

};