import axios from "axios";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const useApi = () => {
    const navigate = useNavigate();

    const handleRequest = useCallback(async (requestFn) => {
        try {
            const response = await requestFn();
            return { data: response.data, error: null };
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/admin/login");
                toast.error("Session expired, please login again");
            }
            return {
                data: null,
                error: error.response?.data?.detail || error.message || "An error occurred",
            };
        }
    }, [navigate]);

    return {
        api,
        handleRequest,
        login: (email, password) => {
            const formData = new URLSearchParams();
            formData.append("username", email);
            formData.append("password", password);
            return api.post("/auth/login", formData);
        },
        getMe: () => api.get("/auth/me"),

        // Cases
        getCases: (skip = 0, limit = 100) => api.get(`/cases/?skip=${skip}&limit=${limit}`),
        getCase: (id) => api.get(`/cases/${id}`),
        createCase: (data) => api.post("/cases/", data),
        updateCase: (id, data) => api.put(`/cases/${id}`, data),
        importCases: (formData) => api.post("/cases/import", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        }),

        // We can add notices, meetings, etc here as needed
    };
};

export default api;
