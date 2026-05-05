import axios from "axios";
import { appConfig } from "../config/appConfig";
import { useAuthStore } from "../store/authStore";

export const api = axios.create({
  baseURL: appConfig.apiUrl,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => api.post("/api/auth/login", data),
  register: (data) => api.post("/api/auth/register", data),
};

export const reportsAPI = {
  fileReport: (formData) =>
    api.post("/api/reports/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getMyReports: () => api.get("/api/reports/mine"),
  getAssignedReports: () => api.get("/api/reports/assigned"),
  getMapData: () => api.get("/api/reports/map"),
  updateStatus: (id, data) => api.patch(`/api/reports/${id}/status`, data),
};

export const adminAPI = {
  getAnalytics: () => api.get("/api/admin/analytics"),
};

export const chatAPI = {
  sendMessage: (message) => api.post("/api/chat/", { message }),
};

export const notificationsAPI = {
  getNotifications: () => api.get("/api/notifications/"),
  markAsRead: (id) => api.patch(`/api/notifications/${id}/read`),
};
