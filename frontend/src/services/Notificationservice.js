import api from "../config/axios";

// ======================================================
// Get My Notifications (latest N, newest first)
// ======================================================

export const getMyNotifications = async (limit = 20) => {

    const response = await api.get("/notifications/my", {
        params: { limit }
    });

    return response.data;

};

// ======================================================
// Get Unread Count Only
// Cheap endpoint used for polling — no need to pull the
// full list just to keep a badge number up to date.
// ======================================================

export const getUnreadCount = async () => {

    const response = await api.get("/notifications/unread-count");

    return response.data;

};

// ======================================================
// Mark One Notification As Read
// ======================================================

export const markNotificationAsRead = async (id) => {

    const response = await api.put(`/notifications/${id}/read`);

    return response.data;

};

// ======================================================
// Mark All Notifications As Read
// ======================================================

export const markAllNotificationsAsRead = async () => {

    const response = await api.put("/notifications/read-all");

    return response.data;

};