import axios from "axios";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE_URL,
});

const sanitizeData = (data) => {
    if (typeof data === 'string') {
        // Basic protection against script tags and common injection patterns
        return data.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
            .replace(/[<>]/g, "");
    }
    if (Array.isArray(data)) return data.map(sanitizeData);
    if (typeof data === 'object' && data !== null) {
        return Object.keys(data).reduce((acc, key) => {
            acc[key] = sanitizeData(data[key]);
            return acc;
        }, {});
    }
    return data;
};

api.interceptors.request.use((config) => {
    // 1. API Injection Prevention: Ensure URL is internal to the configured base
    if (!config.url.startsWith('/')) {
        const url = new URL(config.url, API_BASE_URL);
        if (url.origin !== new URL(API_BASE_URL).origin) {
            throw new Error("Potential API Injection detected: External URL blocked.");
        }
    }

    // 2. Input Sanitization: Clean the request body
    if (config.data && !(config.data instanceof FormData) && !(config.data instanceof URLSearchParams)) {
        config.data = sanitizeData(config.data);
    }

    // 3. Authentication
    if (config.url.startsWith("/portal/case") || config.url.startsWith("/portal/meeting") || config.url.startsWith("/portal/upload")) {
        const portalToken = localStorage.getItem("victim_token");
        if (portalToken) {
            config.headers.Authorization = `Bearer ${portalToken}`;
        }
    } else {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
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
                if (window.location.pathname.startsWith("/portal")) {
                    localStorage.removeItem("victim_token");
                    toast.error("Session expired, please request a new OTP");
                    // We can't easily redirect to the exact portal token without context, so just let the component handle or redirect to home
                } else {
                    localStorage.removeItem("token");
                    navigate("/admin/login");
                    toast.error("Session expired, please login again");
                }
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
        closeCase: (caseId) => api.post(`/cases/${caseId}/close`),
        importCases: (formData) => api.post("/cases/import", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        }),
        assignAdvocate: (caseId, advocate_id) => api.put(`/cases/${caseId}/assign`, { advocate_id }),

        // Notices
        getNotices: (skip = 0, limit = 100) => api.get(`/notices/?skip=${skip}&limit=${limit}`),
        getNotice: (id) => api.get(`/notices/${id}`),
        createNotice: (data) => api.post("/notices/", data),
        resendNotice: (noticeId, channel) =>
            handleRequest(() => api.post(`/notices/${noticeId}/resend${channel ? `?channel=${channel}` : ''}`)),

        // Users
        getUsers: (role) => api.get(role ? `/users/?role=${role}` : "/users/"),

        // Portal
        portalRequestOtp: (token, contact) => api.post(`/portal/${token}/otp/request`, { contact }),
        portalVerifyOtp: (token, contact, otp) => api.post(`/portal/${token}/otp/verify`, { contact, otp }),
        portalGetCase: () => api.get(`/portal/case`),
        portalGetMeetings: () => api.get(`/portal/meetings`),
        portalUploadDoc: (formData) => api.post(`/portal/upload`, formData, { headers: { "Content-Type": "multipart/form-data" } }),

        // Recordings
        getRecordings: (skip = 0, limit = 100) => api.get(`/recordings/?skip=${skip}&limit=${limit}`),
        getRecording: (id) => api.get(`/recordings/${id}`),
        uploadRecording: (caseId, formData) => api.post(`/recordings/${caseId}/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        }),
        downloadRecording: (recordingId) => api.get(`/recordings/${recordingId}/download`, { responseType: 'blob' }),

        // Documents
        getDocuments: (skip = 0, limit = 100) => api.get(`/documents/?skip=${skip}&limit=${limit}`),
        getDocument: (id) => api.get(`/documents/${id}`),
        uploadDocument: (caseId, formData) => api.post(`/documents/${caseId}/upload`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        }),
        downloadDocument: (documentId) => api.get(`/documents/${documentId}/download`, { responseType: 'blob' }),

        // Meetings
        getMeetings: (skip = 0, limit = 100) => api.get(`/meetings/?skip=${skip}&limit=${limit}`),
        getMeeting: (id) => api.get(`/meetings/${id}`),
        createMeeting: (data) => api.post(`/meetings/`, data)
    };
};

export default api;
