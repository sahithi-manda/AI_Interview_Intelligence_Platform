import axios from "axios";

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_BASE_URL ||
        "http://localhost:8000",

    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const authData = localStorage.getItem("auth");

    if (authData) {
        try {
            const { access_token } = JSON.parse(authData);

            if (access_token) {
                config.headers.Authorization = `Bearer ${access_token}`;
            }
        } catch {
            localStorage.removeItem("auth");
        }
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("auth");
        }
        const message =
            error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            "An unexpected error occurred.";
        return Promise.reject(new Error(message));
    },
);

export default api;