import axios from "axios";

const getCsrfToken = () => {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
};

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use(
    (config) => {
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        }

        const method = config.method?.toLowerCase();
        if (["post", "put", "delete", "patch"].includes(method)) {
            const csrfToken = getCsrfToken();
            if (csrfToken) {
                config.headers["x-xsrf-token"] = csrfToken;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("user");
        }

        return Promise.reject(error);
    }
);

export default api;