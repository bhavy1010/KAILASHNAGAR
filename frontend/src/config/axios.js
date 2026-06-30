// ======================================================
// Imports
// ======================================================

import axios from "axios";

// ======================================================
// Axios Instance
// ======================================================

const api = axios.create({

    baseURL: import.meta.env.VITE_API_URL,

    headers: {

        "Content-Type": "application/json"

    },

    withCredentials: false

});

// ======================================================
// Request Interceptor
// ======================================================

api.interceptors.request.use(

    (config) => {

        const token = localStorage.getItem("token");

        if (token) {

            config.headers.Authorization = `Bearer ${token}`;

        }

        return config;

    },

    (error) => Promise.reject(error)

);

// ======================================================
// Response Interceptor
// ======================================================

api.interceptors.response.use(

    (response) => response,

    (error) => {

        if (error.response) {

            if (error.response.status === 401) {

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                window.location.replace("/login");

            }

        }

        return Promise.reject(error);

    }

);

// ======================================================
// Export
// ======================================================

export default api;