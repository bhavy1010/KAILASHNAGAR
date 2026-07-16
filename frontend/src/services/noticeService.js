import api from "../config/axios";

// ======================================================
// Get All Notices (filterable)
// ======================================================

export const getAllNotices = async (filters = {}) => {

    const params = new URLSearchParams(

        Object.entries(filters).filter(

            ([, value]) => value !== "" && value !== undefined

        )

    );

    const response = await api.get("/notices/all?" + params.toString());

    return response.data;

};

// ======================================================
// Get Notice By ID
// ======================================================

export const getNoticeById = async (id) => {

    const response = await api.get("/notices/" + id);

    return response.data;

};

// ======================================================
// Get Notices By Audience
// ======================================================

export const getNoticesByAudience = async (role) => {

    const response = await api.get("/notices/audience/" + role);

    return response.data;

};

// ======================================================
// Search Notices
// ======================================================

export const searchNotices = async (keyword) => {

    const response = await api.get("/notices/search?keyword=" + keyword);

    return response.data;

};

// ======================================================
// Get Archived Notices
// ======================================================

export const getArchivedNotices = async () => {

    const response = await api.get("/notices/archived");

    return response.data;

};

// ======================================================
// Get Notice Dashboard Stats
// ======================================================

export const getNoticeDashboard = async () => {

    const response = await api.get("/notices/dashboard");

    return response.data;

};

// ======================================================
// Create Notice (with optional attachment)
// ======================================================

export const createNotice = async (formData) => {

    const response = await api.post(

        "/notices/add",

        formData,

        {

            headers: {

                "Content-Type": "multipart/form-data"

            }

        }

    );

    return response.data;

};

// ======================================================
// Update Notice (with optional attachment)
// ======================================================

export const updateNotice = async (id, formData) => {

    const response = await api.put(

        "/notices/" + id,

        formData,

        {

            headers: {

                "Content-Type": "multipart/form-data"

            }

        }

    );

    return response.data;

};

// ======================================================
// Archive Notice
// ======================================================

export const archiveNotice = async (id) => {

    const response = await api.put("/notices/" + id + "/archive");

    return response.data;

};

// ======================================================
// Delete Notice
// ======================================================

export const deleteNotice = async (id) => {

    const response = await api.delete("/notices/" + id);

    return response.data;

};