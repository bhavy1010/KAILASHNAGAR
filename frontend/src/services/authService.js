import api from "../config/axios";

// ======================================================
// Login: Admin / Teacher / Student
// ======================================================

export const loginUser = async (loginData) => {
    const response = await api.post(
        "/auth/login",
        loginData
    );

    return response.data;
};

// ======================================================
// Create Admin Account
// ======================================================

export const registerAdmin = async (registerData) => {
    const response = await api.post(
        "/auth/register-admin",
        registerData
    );

    return response.data;
};

// Keeps existing AuthContext working
export const registerUser = registerAdmin;

// ======================================================
// Reset Admin Password
// ======================================================

export const resetAdminPassword = async (resetData) => {
    const response = await api.post(
        "/auth/reset-admin-password",
        resetData
    );

    return response.data;
};

export const resetTeacherPassword = async (resetData) => {
    const response = await api.post(
        "/auth/reset-teacher-password",
        resetData
    );

    return response.data;
};

// ======================================================
// Save Authentication
// The real session lives in an httpOnly cookie the server
// sets on login - JS can't read/write that cookie, and
// that's intentional (protects against XSS token theft).
// We only cache the user's display info here for fast UI
// hydration; actual auth is always re-verified via /auth/me.
// ======================================================

export const saveAuth = (token, user) => {
    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );
};

// ======================================================
// Get Current User (cached, for instant UI paint)
// ======================================================

export const getCurrentUser = () => {
    const user = localStorage.getItem("user");

    return user ? JSON.parse(user) : null;
};

// ======================================================
// Restore Session
// Asks the backend to verify the httpOnly cookie and
// return the logged-in user. This is what actually decides
// whether the user is still logged in - the cookie persists
// across browser restarts until they log out.
// ======================================================

export const fetchCurrentUser = async () => {
    try {
        const response = await api.get("/auth/me");

        if (response.data.success) {
            return response.data.user;
        }

        return null;
    } catch (error) {
        return null;
    }
};

// ======================================================
// Logout
// Tells the backend to clear the auth cookie, then clears
// the locally cached user info.
// ======================================================

export const logoutUser = async () => {
    try {
        await api.post("/auth/logout");
    } catch (error) {
        // Even if the request fails (e.g. offline), still clear
        // local state below so the UI reflects a logged-out state.
    }

    localStorage.removeItem("user");
};