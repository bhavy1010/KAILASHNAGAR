import api from "../config/axios";

export const getDashboardStats = async () => {

    const response = await api.get("/dashboard/stats");

    return response.data;

};