import axios from "axios";

/**
 * API base URL — browser'da çalışırken tarayıcının host'undan türetilir
 * (demo.localhost:3000 → demo.localhost:8000). Bu sayede backend Host
 * header'ından subdomain'i (= tenant) çıkarabilir. SSR / build'de
 * NEXT_PUBLIC_API_URL fallback olarak kullanılır.
 *
 * Production'da farklı host şeması kurulduğunda (örn API_HOST env'i)
 * burası override edilebilir; şimdilik lokal-first.
 */
function resolveApiBase(): string {
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    const port = process.env.NEXT_PUBLIC_API_PORT || "8000";
    return `${protocol}//${hostname}:${port}`;
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}

export const API_BASE = resolveApiBase();

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Public ──────────────────────────────────────────────────────

export const signup = (data: {
  tenant_name: string;
  slug: string;
  owner_email: string;
  owner_password: string;
  owner_first_name: string;
  owner_last_name: string;
  owner_phone: string;
}) => api.post("/signup", data);
// → { tenant: {...}, user: {...}, access_token }

// ── Tenant auth ─────────────────────────────────────────────────
// NOT: Bu endpoint'ler tenant subdomain'inden çağrılmalıdır
// (örn demo.localhost:8000). Subdomain'siz çağrı backend tarafından 400'le
// reddedilir.

export const login = (data: { email: string; password: string }) =>
  api.post("/auth/login", data); // → { access_token }

export const forgotPassword = (phone: string) =>
  api.post("/auth/forgot-password", { phone });

export const resetPassword = (data: { phone: string; code: string; password: string }) =>
  api.post("/auth/reset-password", data);

export const verify = (data: { channel: string; code: string }) =>
  api.post("/auth/verify", data);

export const resendVerification = (data: { channel: string }) =>
  api.post("/auth/me/resend-verification", data);

export const getMe = () => api.get("/auth/me");
// → { id, tenant_id, email, first_name, last_name, role: {id,name,is_system}, permissions: [...], ... }

export const getLoginHistory = () => api.get("/auth/me/logins");

// ── Notifications (stub) ────────────────────────────────────────
export const listNotifications = () => api.get("/notifications/");
export const markRead = (id: number) => api.post(`/notifications/${id}/read`);
export const markAllRead = () => api.post("/notifications/read-all");
