import api from "../config/axios";

// ======================================================
// Apply For Leave
// ======================================================

export const createLeave = async (leaveData) => {

    const response = await api.post(

        "/leave/add",

        leaveData

    );

    return response.data;

};

// ======================================================
// Get All Leaves (optionally filter by status / studentId)
// ======================================================

export const getLeaves = async (filters = {}) => {

    const params = new URLSearchParams(

        Object.entries(filters).filter(

            ([, value]) => value !== "" && value !== undefined

        )

    );

    const response = await api.get(

        `/leave/all?${params.toString()}`

    );

    return response.data;

};

// ======================================================
// Approve / Reject Leave
// ======================================================

export const updateLeaveStatus = async (id, status) => {

    const response = await api.put(

        `/leave/${id}/status`,

        { status }

    );

    return response.data;

};