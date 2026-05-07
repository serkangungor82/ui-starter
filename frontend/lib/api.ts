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

export interface UserMe {
  id: number;
  tenant_id: number;
  tenant: { id: number; name: string; slug: string; status: "trial" | "active" | "suspended" } | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: { id: number; name: string; is_system: boolean } | null;
  permissions: string[];
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
  created_at: string | null;
}

export const getMe = () => api.get<UserMe>("/auth/me");

export const getLoginHistory = () => api.get("/auth/me/logins");

// ── Tenant admin: users ─────────────────────────────────────────

export interface TenantUserSummary {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: { id: number; name: string; is_system: boolean } | null;
  is_active: boolean;
  created_at: string | null;
}

export const listTenantUsers = () => api.get<TenantUserSummary[]>("/tenant/users/");
export const getTenantUser = (id: number) => api.get<TenantUserSummary>(`/tenant/users/${id}`);
export const createTenantUser = (data: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role_id: number;
}) => api.post<TenantUserSummary>("/tenant/users/", data);
export const updateTenantUser = (
  id: number,
  data: { first_name?: string; last_name?: string; role_id?: number; is_active?: boolean },
) => api.patch<TenantUserSummary>(`/tenant/users/${id}`, data);
export const deleteTenantUser = (id: number) => api.delete<void>(`/tenant/users/${id}`);

// ── Tenant admin: roles ─────────────────────────────────────────

export interface TenantRoleSummary {
  id: number;
  name: string;
  description: string | null;
  is_system: boolean;
  permissions: string[];
  created_at: string | null;
}

export const listTenantRoles = () => api.get<TenantRoleSummary[]>("/tenant/roles/");
export const getTenantRole = (id: number) => api.get<TenantRoleSummary>(`/tenant/roles/${id}`);
export const createTenantRole = (data: {
  name: string;
  description?: string;
  permission_keys: string[];
}) => api.post<TenantRoleSummary>("/tenant/roles/", data);
export const updateTenantRole = (
  id: number,
  data: { name?: string; description?: string; permission_keys?: string[] },
) => api.patch<TenantRoleSummary>(`/tenant/roles/${id}`, data);
export const deleteTenantRole = (id: number) => api.delete<void>(`/tenant/roles/${id}`);

// ── Tenant admin: permissions registry ──────────────────────────

export interface PermissionInfo {
  id: number;
  key: string;
  name: string;
  description: string | null;
}

export const listTenantPermissions = () => api.get<PermissionInfo[]>("/tenant/permissions/");

// ── Platform admin (Super Admin) ────────────────────────────────

export interface PlatformMe {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string | null;
}

export interface PlatformTenantSummary {
  id: number;
  name: string;
  slug: string;
  status: "trial" | "active" | "suspended";
  user_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface PlatformTenantUserSummary {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  is_active: boolean;
  created_at: string | null;
}

export interface PlatformStats {
  tenants: {
    total: number;
    by_status: Record<"trial" | "active" | "suspended", number>;
  };
  users: { total: number; active: number };
  platform_users: number;
}

export const platformLogin = (data: { email: string; password: string }) =>
  api.post<{ access_token: string; token_type: string }>("/platform/auth/login", data);

export const platformGetMe = () => api.get<PlatformMe>("/platform/auth/me");

export const listPlatformTenants = () =>
  api.get<PlatformTenantSummary[]>("/platform/tenants/");

export const createPlatformTenant = (data: {
  name: string;
  slug: string;
  owner_email: string;
  owner_password: string;
  owner_first_name: string;
  owner_last_name: string;
  owner_phone: string;
}) => api.post<PlatformTenantSummary>("/platform/tenants/", data);

export const getPlatformTenant = (id: number) =>
  api.get<PlatformTenantSummary>(`/platform/tenants/${id}`);

export const updatePlatformTenant = (
  id: number,
  data: { name?: string; status?: "trial" | "active" | "suspended" },
) => api.patch<PlatformTenantSummary>(`/platform/tenants/${id}`, data);

export const listPlatformTenantUsers = (id: number) =>
  api.get<PlatformTenantUserSummary[]>(`/platform/tenants/${id}/users`);

export const getPlatformStats = () => api.get<PlatformStats>("/platform/stats/");


// ── Tenant: products & services ─────────────────────────────────

export type ProductType = "product" | "service";

export interface ProductFeature {
  name: string;
  value: string;
}

export interface ProductSummary {
  id: number;
  type: ProductType;
  name: string;
  sku: string | null;
  barcode: string | null;
  qr_code: string | null;
  short_description: string | null;
  long_description: string | null;
  features: ProductFeature[] | null;
  price: string | null;
  currency: string;
  vat_rate: string | null;
  unit: string | null;
  stock_quantity: string | null;
  min_stock: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_slug: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProductInput {
  type: ProductType;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  qr_code?: string | null;
  short_description?: string | null;
  long_description?: string | null;
  features?: ProductFeature[] | null;
  price?: string | number | null;
  currency?: string;
  vat_rate?: string | number | null;
  unit?: string | null;
  stock_quantity?: string | number | null;
  min_stock?: string | number | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_slug?: string | null;
  is_active?: boolean;
}

export const listProducts = (params?: {
  type?: ProductType;
  q?: string;
  only_active?: boolean;
}) => api.get<ProductSummary[]>("/tenant/products/", { params });

export const getProduct = (id: number) =>
  api.get<ProductSummary>(`/tenant/products/${id}`);

export const createProduct = (data: ProductInput) =>
  api.post<ProductSummary>("/tenant/products/", data);

export const updateProduct = (id: number, data: Partial<ProductInput>) =>
  api.patch<ProductSummary>(`/tenant/products/${id}`, data);

export const deleteProduct = (id: number) =>
  api.delete<void>(`/tenant/products/${id}`);


// ── Notifications (stub) ────────────────────────────────────────
export const listNotifications = () => api.get("/notifications/");
export const markRead = (id: number) => api.post(`/notifications/${id}/read`);
export const markAllRead = () => api.post("/notifications/read-all");
