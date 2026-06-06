import {
  clearAuth,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  saveAuth,
} from "@/lib/auth-storage";
import type {
  ApiResponse,
  ApiUser,
  AuthTokens,
  AdminAnalytics,
  AdminOverview,
  AuditLogEntry,
  DashboardAnalytics,
  DonationRequestRecord,
  DonationRequestWithMatch,
  MedicineRecord,
  PharmacistStats,
  UploadMedicineResult,
  OcrSuggestResponse,
} from "@/types/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

export class ApiError extends Error {
  status: number;
  code?: string;
  errors?: { msg: string; path: string }[];

  constructor(
    message: string,
    status: number,
    code?: string,
    errors?: { msg: string; path: string }[]
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

async function parseJson<T>(res: Response): Promise<ApiResponse<T>> {
  const body = (await res.json()) as ApiResponse<T>;
  return body;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearAuth();
    return null;
  }

  const body = await parseJson<AuthTokens>(res);
  const user = getStoredUser();
  if (!user) {
    clearAuth();
    return null;
  }

  saveAuth(body.data, user);
  return body.data.accessToken;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(
      `Cannot reach API at ${API_URL}. Start the backend: cd backend && npm run dev`,
      0,
      "NETWORK_ERROR"
    );
  }

  if (res.status === 401 && retry && getRefreshToken()) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch<T>(path, options, false);
    }
  }

  let body: ApiResponse<T>;
  try {
    body = await parseJson<T>(res);
  } catch {
    throw new ApiError(
      res.ok
        ? "Invalid response from server"
        : `Request failed (${res.status}). Check backend logs and CORS.`,
      res.status,
      "PARSE_ERROR"
    );
  }

  if (!res.ok || !body.success) {
    throw new ApiError(
      body.message || "Request failed",
      res.status,
      (body as { code?: string }).code,
      body.errors
    );
  }

  return body.data;
}

export const api = {
  login(email: string, password: string) {
    return apiFetch<{ user: ApiUser } & AuthTokens>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register(full_name: string, email: string, password: string, role?: string) {
    return apiFetch<{ user: ApiUser } & AuthTokens>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ full_name, email, password, role }),
    });
  },

  logout() {
    const refreshToken = getRefreshToken();
    return apiFetch<null>("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken: refreshToken || "" }),
    }).catch(() => null);
  },

  me() {
    return apiFetch<ApiUser>("/api/auth/me");
  },

  getDashboardAnalytics() {
    return apiFetch<DashboardAnalytics>("/api/analytics/dashboard");
  },

  listMedicines(limit = 10) {
    return apiFetch<{ medicines: MedicineRecord[]; limit: number; offset: number }>(
      `/api/medicines?limit=${limit}&offset=0`
    );
  },

  listMyDonations() {
    return apiFetch<MedicineRecord[]>("/api/medicines/donor/my");
  },

  getOcrSuggestions(file: File) {
    const form = new FormData();
    form.append("image", file);
    return apiFetch<OcrSuggestResponse>("/api/medicines/ocr-suggest", {
      method: "POST",
      body: form,
    });
  },

  uploadMedicine(file: File, fields: Record<string, string>) {
    const form = new FormData();
    form.append("image", file);
    Object.entries(fields).forEach(([k, v]) => {
      if (v) form.append(k, v);
    });
    return apiFetch<UploadMedicineResult>("/api/medicines/upload", {
      method: "POST",
      body: form,
    });
  },

  listPendingVerification() {
    return apiFetch<MedicineRecord[]>("/api/pharmacist/pending");
  },

  getPharmacistStats() {
    return apiFetch<PharmacistStats>("/api/pharmacist/stats");
  },

  getMedicineForVerification(id: string) {
    return apiFetch<{
      medicine: MedicineRecord;
      auditTrail: AuditLogEntry[];
    }>(`/api/pharmacist/medicine/${id}`);
  },

  approveMedicine(id: string, notes?: string) {
    return apiFetch<MedicineRecord>(`/api/pharmacist/approve/${id}`, {
      method: "PUT",
      body: JSON.stringify({ notes }),
    });
  },

  rejectMedicine(id: string, notes?: string) {
    return apiFetch<MedicineRecord>(`/api/pharmacist/reject/${id}`, {
      method: "PUT",
      body: JSON.stringify({ notes }),
    });
  },

  async listRequests(withMatches = false) {
    const q = withMatches ? "?match=true" : "";
    const data = await apiFetch<DonationRequestWithMatch[] | null>(
      `/api/requests${q}`
    );
    return Array.isArray(data) ? data : [];
  },

  getAdminOverview() {
    return apiFetch<AdminOverview>("/api/admin/overview");
  },

  getAdminAnalytics() {
    return apiFetch<AdminAnalytics>("/api/admin/analytics");
  },

  listAdminMedicines(params?: {
    status?: string;
    search?: string;
    category?: string;
    expiry_before?: string;
  }) {
    const sp = new URLSearchParams();
    if (params?.status) sp.set("status", params.status);
    if (params?.search) sp.set("search", params.search);
    if (params?.category) sp.set("category", params.category);
    if (params?.expiry_before) sp.set("expiry_before", params.expiry_before);
    const q = sp.toString();
    return apiFetch<MedicineRecord[]>(`/api/admin/medicines${q ? `?${q}` : ""}`);
  },

  getAdminRecentDonations() {
    return apiFetch<MedicineRecord[]>("/api/admin/recent/donations");
  },

  getAdminRecentRequests() {
    return apiFetch<DonationRequestRecord[]>("/api/admin/recent/requests");
  },

  myRequests() {
    return apiFetch<DonationRequestRecord[]>("/api/requests/my").then((data) =>
      Array.isArray(data) ? data : []
    );
  },

  approveRequest(id: string) {
    return apiFetch<DonationRequestRecord>(`/api/requests/${id}/approve`, {
      method: "PUT",
    });
  },

  rejectRequest(id: string) {
    return apiFetch<DonationRequestRecord>(`/api/requests/${id}/reject`, {
      method: "PUT",
    });
  },
};

export { API_URL };
