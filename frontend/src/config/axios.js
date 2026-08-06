import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    // Required so the browser sends/receives the httpOnly auth cookie
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use(
    (config) => {
        // Let the browser set multipart/form-data boundary automatically.
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // httpOnly cookie is invalid/expired - clear the cached
            // display user so the UI reflects a logged-out state.
            localStorage.removeItem("user");
        }

        return Promise.reject(error);
    }
);

export default api;