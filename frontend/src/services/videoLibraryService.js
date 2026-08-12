import api from "../config/axios";

export const getVideoLibrary = async (params = {}) => {
    const query = new URLSearchParams();
    if (params.standard) query.append("standard", params.standard);
    if (params.subject) query.append("subject", params.subject);
    if (params.targetScope) query.append("targetScope", params.targetScope);
    if (params.search) query.append("search", params.search);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    const response = await api.get(`/video-library/all${queryString}`);
    return response.data;
};

export const addVideoLibrary = async (videoData) => {
    const response = await api.post("/video-library/add", videoData);
    return response.data;
};

export const deleteVideoLibrary = async (id) => {
    const response = await api.delete(`/video-library/${id}`);
    return response.data;
};
