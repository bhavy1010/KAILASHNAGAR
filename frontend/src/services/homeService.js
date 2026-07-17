import api from "../config/axios";

// ======================================================
// Public Home Page
// ======================================================

export const getPublicHomeData = async () => {
    const response = await api.get("/home/public");

    return response.data;
};

// ======================================================
// School Information
// ======================================================

export const getSchoolInfo = async () => {
    const response = await api.get("/home/school-info");

    return response.data;
};

export const updateSchoolInfo = async (data) => {
    const response = await api.put(
        "/home/school-info",
        data
    );

    return response.data;
};

// ======================================================
// Achievement Management
// ======================================================

export const getAllAchievements = async () => {
    const response = await api.get("/home/achievements");

    return response.data;
};

export const createAchievement = async (formData) => {
    const response = await api.post(
        "/home/achievements",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return response.data;
};

export const updateAchievement = async (id, formData) => {
    const response = await api.put(
        `/home/achievements/${id}`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return response.data;
};

export const deleteAchievement = async (id) => {
    const response = await api.delete(
        `/home/achievements/${id}`
    );

    return response.data;
};

// ======================================================
// Today's Rose Management
// ======================================================

export const getAllTodayRoses = async () => {
    const response = await api.get("/home/today-roses");

    return response.data;
};

export const saveTodayRose = async (formData) => {
    const response = await api.post(
        "/home/today-roses",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return response.data;
};

export const deleteTodayRose = async (id) => {
    const response = await api.delete(
        `/home/today-roses/${id}`
    );

    return response.data;
};