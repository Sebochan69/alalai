/**
 * API service layer — wired to FastAPI backend at NEXT_PUBLIC_API_URL.
 *
 * Token lifecycle:
 *   After login  -> storeToken(token)  saves to localStorage + cookie
 *   Server components -> token read from cookie via next/headers
 *   Client components -> token read from localStorage
 *   After logout  -> clearToken()
 *
 * Backend base URL is read from NEXT_PUBLIC_API_URL (set in .env.local):
 *   NEXT_PUBLIC_API_URL=https://alalai-be.vercel.app/api
 */

import type {
  AuthResponse,
  AdminUser,
  AdminUserDto,
  ChangePasswordDto,
  Complaint,
  CreateComplaintDto,
  LoginDto,
  MonthlyReport,
  RegisterDto,
  UpdateComplaintDto,
  User,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://alalai-be.vercel.app/api";

// --- Token helpers ------------------------------------------------------------

export function storeToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("alalai_token", token);
  document.cookie = `alalai_token=${token}; path=/; max-age=86400; SameSite=Strict`;
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("alalai_token");
  document.cookie = "alalai_token=; path=/; max-age=0";
}

function isSessionExpired(status: number, detail = "") {
  const text = detail.toLowerCase();
  return (
    status === 401 ||
    text.includes("invalid token") ||
    text.includes("not authenticated") ||
    text.includes("could not validate credentials")
  );
}

function expireClientSession() {
  if (typeof window === "undefined") return;
  clearToken();
  if (!window.location.pathname.startsWith("/login")) {
    window.location.replace("/login?session=expired");
  }
}

async function handleAuthFailure(res: Response) {
  const detail = await res
    .clone()
    .text()
    .catch(() => "");
  if (isSessionExpired(res.status, detail)) expireClientSession();
  return detail;
}

async function resolveToken(explicit?: string): Promise<string | null> {
  if (explicit) return explicit;
  if (typeof window !== "undefined") {
    return localStorage.getItem("alalai_token");
  }
  // Server component: read from cookie via next/headers
  try {
    const { cookies } = await import("next/headers");
    const store = await cookies();
    return store.get("alalai_token")?.value ?? null;
  } catch {
    return null;
  }
}

function authHeader(token: string | null): HeadersInit {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** GET /api/auth/me — returns the current logged-in user. */
export async function getCurrentUser(): Promise<User | null> {
  const token = await resolveToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: authHeader(token),
      cache: "no-store",
    });
    if (!res.ok) {
      await handleAuthFailure(res);
      return null;
    }
    const raw = await res.json();
    return {
      id: String(raw.id),
      username: raw.username,
      email_address: raw.email_address,
      role: (raw.role ?? "citizen").toLowerCase() as User["role"],
      location_assigned: raw.location_assigned ?? "",
    };
  } catch {
    return null;
  }
}

// --- Mapper: BE ReportOut -> FE Complaint ------------------------------------

type ApiRecord = Record<string, unknown>;

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return undefined;
}

function latestComment(raw: ApiRecord): ApiRecord | null {
  const adminOnly = (value: unknown): ApiRecord | null => {
    if (typeof value !== "object" || value === null) return null;
    const record = value as ApiRecord;
    const role = firstString(
      record.author_role,
      record.user_role,
      record.role,
    )?.toLowerCase();
    return !role || role.includes("admin") ? record : null;
  };

  const comments = raw.comments;
  if (Array.isArray(comments) && comments.length > 0) {
    for (let i = comments.length - 1; i >= 0; i -= 1) {
      const comment = adminOnly(comments[i]);
      if (comment) return comment;
    }
    return null;
  }

  const latest = raw.latest_comment ?? raw.comment;
  return adminOnly(latest);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapReport(r: any): Complaint {
  const comment = latestComment(r);
  const createdAt =
    firstString(
      r.created_at,
      r.createdAt,
      r.date_created,
      r.date_filed,
      r.submitted_at,
      r.reported_at,
      r.timestamp,
    ) ?? "";
  const updatedAt =
    firstString(
      r.updated_at,
      r.updatedAt,
      r.date_updated,
      r.modified_at,
      r.last_updated,
      r.status_updated_at,
      comment?.created_at,
      createdAt,
    ) ?? "";

  // Normalize status: "Pending" -> "pending", "In Progress" -> "in-progress", etc.
  const rawStatus = (r.status ?? "pending") as string;
  const statusMap: Record<string, string> = {
    pending: "pending",
    "in progress": "in-progress",
    "in-progress": "in-progress",
    "for review": "for-review",
    "for-review": "for-review",
    resolved: "resolved",
  };
  const status = statusMap[rawStatus.toLowerCase()] ?? "pending";

  // Normalize priority: "High" -> "high", etc.
  const priority = (r.priority ?? "medium").toLowerCase();

  return {
    id: String(r.id),
    user_id: String(r.user_id ?? ""),
    location: r.address ?? r.location ?? "",
    lat:
      r.latitude != null || r.lat != null
        ? isNaN(parseFloat(r.latitude ?? r.lat))
          ? undefined
          : parseFloat(r.latitude ?? r.lat)
        : undefined,
    lng:
      r.longitude != null || r.long != null || r.lng != null
        ? isNaN(parseFloat(r.longitude ?? r.long ?? r.lng))
          ? undefined
          : parseFloat(r.longitude ?? r.long ?? r.lng)
        : undefined,
    email_address: r.email_address ?? r.email ?? "",
    status: status as Complaint["status"],
    description: r.description ?? "",
    priority: priority as Complaint["priority"],
    media: r.photo_url ?? r.media ?? undefined,
    tagging: r.tag ?? r.tagging ?? "",
    created_at: createdAt,
    updated_at: updatedAt,
    summary: r.ai_summary ?? r.summary ?? undefined,
    location_area: r.location_area ?? undefined,
    adminComment: firstString(
      r.admin_comment,
      r.adminComment,
      r.comment,
      r.comment_content,
      r.latest_comment,
      comment?.content,
      comment?.comment,
      comment?.admin_comment,
      comment?.message,
    ),
    adminCommentDate: firstString(
      r.admin_comment_date,
      r.comment_created_at,
      r.latest_comment_created_at,
      comment?.created_at,
      comment?.updated_at,
    ),
    citizenName: r.username ?? r.citizenName ?? undefined,
    adminName: firstString(
      r.admin_name,
      r.adminName,
      r.assigned_admin,
      r.assigned_to?.username,
      comment?.username,
      comment?.admin_name,
    ),
  };
}

function mapUser(raw: ApiRecord): User {
  return {
    id: String(raw.id),
    username: firstString(raw.username, raw.name) ?? "",
    email_address: firstString(raw.email_address, raw.email) ?? "",
    role: ((firstString(raw.role) ?? "citizen").toLowerCase() === "admin"
      ? "admin"
      : "citizen") as User["role"],
    location_assigned: firstString(raw.location_assigned) ?? "",
    created_at: firstString(raw.created_at),
  };
}

function mapAdmin(raw: ApiRecord): AdminUser {
  return {
    ...mapUser({ ...raw, role: "admin" }),
    active_reports:
      typeof raw.active_reports === "number"
        ? raw.active_reports
        : typeof raw.activeReports === "number"
          ? raw.activeReports
          : undefined,
  };
}

// --- Auth --------------------------------------------------------------------

/**
 * POST /api/auth/login  (form-urlencoded: username, password)
 * Then GET /api/auth/me for full user profile.
 */
export async function login(dto: LoginDto): Promise<AuthResponse> {
  const body = new URLSearchParams();
  body.append("username", dto.username);
  body.append("password", dto.password);

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    let detail = "Invalid username or password";
    try {
      const err = await res.json();
      if (err?.detail) detail = err.detail;
    } catch {
      /* response body unreadable (CORS) — use default message */
    }
    throw new Error(detail);
  }
  const data: { access_token: string; token_type: string } = await res.json();

  const meRes = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  if (!meRes.ok) throw new Error("Failed to load user profile");
  const raw = await meRes.json();

  const user = mapUser(raw);

  return { token: data.access_token, user };
}

/**
 * POST /api/auth/register - citizen registration.
 */
export async function register(dto: RegisterDto): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: dto.username,
      email_address: dto.email,
      password: dto.password,
      location_assigned: dto.location_assigned ?? "",
    }),
  });
  if (!res.ok) {
    let detail = "Registration failed. Please try again.";
    try {
      const err = await res.json();
      if (err?.detail) detail = err.detail;
    } catch {
      detail = await res.text().catch(() => detail);
    }
    throw new Error(detail);
  }

  await res.text().catch(() => "");
}

export async function changePassword(dto: ChangePasswordDto): Promise<void> {
  const token = await resolveToken();
  const payload = JSON.stringify(dto);

  let lastDetail = "Could not change password. Please try again.";
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: "POST",
    headers: { ...authHeader(token), "Content-Type": "application/json" },
    body: payload,
  });
  if (res.ok) return;
  lastDetail = await handleAuthFailure(res);
  throw new Error(lastDetail || "Could not change password. Please try again.");
}

export async function getAdmins(): Promise<AdminUser[]> {
  const token = await resolveToken();
  const res = await fetch(`${API_BASE}/users/admins`, {
    headers: { ...authHeader(token), "Cache-Control": "no-cache" },
    cache: "no-store",
  });
  if (res.ok) {
    const data = await res.json();
    return Array.isArray(data) ? data.map(mapAdmin) : [];
  }

  if (res.status !== 404) {
    await handleAuthFailure(res);
    return [];
  }

  const fallback = await fetch(`${API_BASE}/users/`, {
    headers: { ...authHeader(token), "Cache-Control": "no-cache" },
    cache: "no-store",
  });
  if (!fallback.ok) {
    await handleAuthFailure(fallback);
    return [];
  }
  const data = await fallback.json();
  return Array.isArray(data)
    ? data
        .map((item: ApiRecord) => mapUser(item))
        .filter((user: User) => user.role === "admin")
        .map((user: User) => ({ ...user, active_reports: undefined }))
    : [];
}

export async function createAdmin(
  dto: Required<AdminUserDto>,
): Promise<AdminUser> {
  const token = await resolveToken();
  const res = await fetch(`${API_BASE}/users/admins`, {
    method: "POST",
    headers: { ...authHeader(token), "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error(await handleAuthFailure(res));
  return mapAdmin(await res.json());
}

export async function updateAdmin(
  id: string,
  dto: AdminUserDto,
): Promise<AdminUser> {
  const token = await resolveToken();
  const body = JSON.stringify(
    Object.fromEntries(
      Object.entries(dto).filter(
        ([, value]) => value !== undefined && value !== "",
      ),
    ),
  );
  const endpoints = [
    `${API_BASE}/users/admins/${id}`,
    `${API_BASE}/users/${id}`,
  ];

  let lastDetail = "Could not update admin.";
  for (const endpoint of endpoints) {
    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: { ...authHeader(token), "Content-Type": "application/json" },
      body,
    });
    if (res.ok) return mapAdmin(await res.json());
    lastDetail = await handleAuthFailure(res);
    if (res.status !== 404 && res.status !== 405) break;
  }
  throw new Error(lastDetail || "Could not update admin.");
}

export async function deleteAdmin(id: string): Promise<void> {
  const token = await resolveToken();
  const endpoints = [
    `${API_BASE}/users/admins/${id}`,
    `${API_BASE}/users/${id}`,
  ];

  let lastDetail = "Could not delete admin.";
  for (const endpoint of endpoints) {
    const res = await fetch(endpoint, {
      method: "DELETE",
      headers: authHeader(token),
    });
    if (res.ok || res.status === 204) return;
    lastDetail = await handleAuthFailure(res);
    if (res.status !== 404 && res.status !== 405) break;
  }
  throw new Error(lastDetail || "Could not delete admin.");
}

// --- Reports (citizen) -------------------------------------------------------

/** GET /api/reports/mine  (Bearer token) */
export async function getMyComplaints(_token?: string): Promise<Complaint[]> {
  const token = await resolveToken(_token);
  const res = await fetch(`${API_BASE}/reports/mine`, {
    headers: authHeader(token),
  });
  if (!res.ok) {
    await handleAuthFailure(res);
    return [];
  }
  const data = await res.json();
  return Array.isArray(data) ? data.map(mapReport) : [];
}

/** GET /api/complaints/{id} */
export async function getComplaint(
  id: string,
  _token?: string,
): Promise<Complaint | null> {
  const token = await resolveToken(_token);
  const res = await fetch(`${API_BASE}/complaints/${id}`, {
    headers: authHeader(token),
  });
  if (!res.ok) {
    await handleAuthFailure(res);
    return null;
  }
  return mapReport(await res.json());
}

/** POST /api/reports/  (multipart/form-data: address, description, latitude?, longitude?, photo?) */
export async function createComplaint(
  dto: CreateComplaintDto,
  _token?: string,
): Promise<Complaint> {
  const token = await resolveToken(_token);
  const form = new FormData();
  form.append("address", dto.location);
  form.append("description", dto.description);
  if (dto.lat != null) form.append("latitude", String(dto.lat));
  if (dto.long != null) form.append("longitude", String(dto.long));
  if (dto.media) form.append("photo", dto.media);

  const res = await fetch(`${API_BASE}/reports/`, {
    method: "POST",
    headers: authHeader(token),
    body: form,
  });
  if (!res.ok) throw new Error(await handleAuthFailure(res));
  return mapReport(await res.json());
}

/** PATCH /api/reports/{id}/status  { status: "resolved" } */
export async function closeComplaint(
  id: string,
  _token?: string,
): Promise<Complaint> {
  const token = await resolveToken(_token);
  const res = await fetch(`${API_BASE}/reports/${id}/status`, {
    method: "PATCH",
    headers: { ...authHeader(token), "Content-Type": "application/json" },
    body: JSON.stringify({ status: "resolved" }),
  });
  if (!res.ok) {
    const detail = await handleAuthFailure(res);

    if (res.status === 403) {
      const fallback = await fetch(`${API_BASE}/complaints/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });
      if (fallback.ok) return mapReport(await fallback.json());
      throw new Error(`${fallback.status} ${await handleAuthFailure(fallback)}`);
    }

    throw new Error(`${res.status} ${detail}`);
  }
  return mapReport(await res.json());
}

// --- Reports (admin) ---------------------------------------------------------

/** GET /api/reports/assigned  (Bearer token) */
export async function getAdminComplaints(
  _token?: string,
): Promise<Complaint[]> {
  const token = await resolveToken(_token);
  const res = await fetch(`${API_BASE}/reports/assigned`, {
    headers: authHeader(token),
  });
  if (!res.ok) {
    await handleAuthFailure(res);
    return [];
  }
  const data = await res.json();
  return Array.isArray(data) ? data.map(mapReport) : [];
}

/** GET /api/complaints/{id} */
export async function getAdminComplaint(
  id: string,
  _token?: string,
): Promise<Complaint | null> {
  const token = await resolveToken(_token);
  const res = await fetch(`${API_BASE}/complaints/${id}`, {
    headers: authHeader(token),
  });
  if (!res.ok) {
    await handleAuthFailure(res);
    return null;
  }
  return mapReport(await res.json());
}

/** PATCH /api/complaints/{id}  (Bearer token) */
export async function updateComplaint(
  id: string,
  dto: UpdateComplaintDto,
  _token?: string,
): Promise<Complaint> {
  const token = await resolveToken(_token);
  let latest: Complaint | null = null;

  if (dto.assigned != null) {
    const res = await fetch(`${API_BASE}/complaints/${id}`, {
      method: "PATCH",
      headers: { ...authHeader(token), "Content-Type": "application/json" },
      body: JSON.stringify({ assigned_id: dto.assigned }),
    });
    if (!res.ok) throw new Error(await handleAuthFailure(res));
    latest = mapReport(await res.json());
  }

  if (dto.status || dto.adminComment != null) {
    const existing = await getAdminComplaint(id, token ?? undefined);
    const existingStatus = latest?.status ?? existing?.status;
    const payload: Record<string, unknown> = {
      status: dto.status ?? existingStatus ?? "pending",
    };
    if (dto.adminComment != null) payload.admin_comment = dto.adminComment;

    const res = await fetch(`${API_BASE}/reports/${id}/status`, {
      method: "PATCH",
      headers: { ...authHeader(token), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await handleAuthFailure(res));
    latest = mapReport(await res.json());
  }

  if (latest) return latest;
  const existing = await getAdminComplaint(id, token ?? undefined);
  if (existing) return existing;
  throw new Error("Report not found");
}

// --- Monthly report ----------------------------------------------------------

/** GET /api/reports/monthly/{YYYY-MM}  (Bearer token) */
export async function getMonthlyReport(
  _token?: string,
): Promise<MonthlyReport | null> {
  const token = await resolveToken(_token);
  const month = new Date().toISOString().slice(0, 7);
  const res = await fetch(`${API_BASE}/reports/monthly/${month}`, {
    headers: authHeader(token),
  });
  if (!res.ok) {
    const detail = await handleAuthFailure(res);
    if (
      res.status === 404 ||
      detail.toLowerCase().includes("monthly report not found")
    ) {
      return null;
    }
    throw new Error(detail);
  }
  const data = await res.json();
  return {
    id: String(data.id),
    month: data.month,
    overall_complaint_count: data.overall_complaint_count ?? 0,
    overall_completion_rate: Math.min(
      100,
      Math.max(0, data.overall_completion_rate ?? 0),
    ),
    forecast: data.forecast ?? "",
    suggest_actions: Array.isArray(data.suggest_actions)
      ? data.suggest_actions
      : [],
    avg_solution_days: data.avg_solution_days ?? 0,
    category_breakdown: data.category_breakdown ?? {},
    created_at: data.created_at,
  };
}

// --- Map data ----------------------------------------------------------------

/** GET /api/reports/map  (Bearer token) */
export async function getMapData(_token?: string): Promise<Complaint[]> {
  const token = await resolveToken(_token);
  const res = await fetch(`${API_BASE}/reports/map`, {
    headers: authHeader(token),
  });
  if (!res.ok) {
    await handleAuthFailure(res);
    return [];
  }
  const data = await res.json();
  const items = Array.isArray(data) ? data : [];
  return items
    .map(mapReport)
    .filter((c: Complaint) => c.lat != null && c.lng != null);
}

/**
 * Geocode a free-text location string to [lng, lat] using MapTiler.
 * Falls back to null if the key is missing or geocoding fails.
 */
export async function geocodeLocation(
  location: string,
): Promise<[number, number] | null> {
  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (!key || !location) return null;
  try {
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json?key=${key}&limit=1`;
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data?.features?.[0];
    if (!feature) return null;
    const [lng, lat] = feature.center as [number, number];
    return [lng, lat];
  } catch {
    return null;
  }
}

// --- Chat --------------------------------------------------------------------

/**
 * POST /api/chat/  { message } -> { reply }
 * No auth required.
 */
export async function chatWithBot(message: string): Promise<string> {
  const res = await fetch(`${API_BASE}/chat/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data: { reply: string } = await res.json();
  return data.reply;
}
