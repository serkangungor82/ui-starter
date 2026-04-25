import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auth ────────────────────────────────────────────────────────
// Backend için beklenen endpoint sözleşmeleri yorum olarak verildi.
// Kendi backend'inize bağlarken dönen veri şekli aynı kalmalı.

export const register = (data: {
  email: string; first_name: string; last_name: string; phone: string; password: string;
}) => api.post("/auth/register", data);

export const login = (data: { email: string; password: string }) =>
  api.post("/auth/login", data); // → { access_token: string }

export const forgotPassword = (email: string) =>
  api.post("/auth/forgot-password", { email });

export const resetPassword = (data: { email: string; code: string; password: string }) =>
  api.post("/auth/reset-password", data);

export const verify = (data: { channel: string; code: string }) =>
  api.post("/auth/verify", data);

export const resendVerification = (data: { channel: string }) =>
  api.post("/auth/me/resend-verification", data);

export const getMe = () => api.get("/auth/me");
// → { id, email, first_name, last_name, phone, email_verified, phone_verified, is_admin, ... }

export const getLoginHistory = () => api.get("/auth/me/logins");
// → [{ ip, user_agent, created_at }]

export const updatePhone = (data: { phone: string }) =>
  api.patch("/auth/me/phone", data);

export const updateEmail = (data: { email: string }) =>
  api.patch("/auth/me/email", data);

// ── Notifications (örnek) ───────────────────────────────────────
export const listNotifications = () => api.get("/notifications/");
// → [{ id, title, message, type, read, created_at }]

export const markRead = (id: number) => api.post(`/notifications/${id}/read`);
export const markAllRead = () => api.post("/notifications/read-all");
