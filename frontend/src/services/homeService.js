import api from "../config/axios";

const createFormData = (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            formData.append(key, value);
        }
    });

    return formData;
};

// Public home page
export const getPublicHomeData = async () => {
    const response = await api.get("/home/public");
    return response.data;
};

// School information
export const getSchoolInfo = async () => {
    const response = await api.get("/home/school-info");
    return response.data;
};

export const updateSchoolInfo = async (schoolData) => {
    const response = await api.put(
        "/home/school-info",
        createFormData(schoolData)
    );

    return response.data;
};

// Achievements
export const getAchievements = async () => {
    const response = await api.get("/home/achievements");
    return response.data;
};

export const createAchievement = async (achievementData) => {
    const response = await api.post(
        "/home/achievements",
        createFormData(achievementData)
    );

    return response.data;
};

export const deleteAchievement = async (id) => {
    const response = await api.delete(`/home/achievements/${id}`);
    return response.data;
};

// Today's Rose
export const getTodayRoses = async () => {
    const response = await api.get("/home/today-roses");
    return response.data;
};

export const createTodayRose = async (roseData) => {
    const response = await api.post(
        "/home/today-roses",
        createFormData(roseData)
    );

    return response.data;
};

export const deleteTodayRose = async (id) => {
    const response = await api.delete(`/home/today-roses/${id}`);
    return response.data;
};

// Photo Gallery
export const getGalleryPhotos = async () => {
    const response = await api.get("/home/gallery");
    return response.data;
};

export const addGalleryPhoto = async (galleryData) => {
    const response = await api.post(
        "/home/gallery",
        createFormData(galleryData)
    );

    return response.data;
};

export const deleteGalleryPhoto = async (id) => {
    const response = await api.delete(`/home/gallery/${id}`);
    return response.data;
};