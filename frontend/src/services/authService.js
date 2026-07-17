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

// ======================================================
// Save Authentication
// ======================================================

export const saveAuth = (token, user) => {
    localStorage.setItem("token", token);

    localStorage.setItem(
        "user",
        JSON.stringify(user)
    );
};

// ======================================================
// Get Current User
// ======================================================

export const getCurrentUser = () => {
    const user = localStorage.getItem("user");

    return user ? JSON.parse(user) : null;
};

// ======================================================
// Get Token
// ======================================================

export const getToken = () => {
    return localStorage.getItem("token");
};

// ======================================================
// Check Authentication
// ======================================================

export const isAuthenticated = () => {
    return !!localStorage.getItem("token");
};

// ======================================================
// Logout
// ======================================================

export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};