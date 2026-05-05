/**
 * API service layer.
 *
 * All functions are async and typed. Mock data is used now; swap each
 * function body for a real fetch call once the FastAPI backend is ready.
 *
 * Backend base URL is read from NEXT_PUBLIC_API_URL (set in .env.local):
 *   NEXT_PUBLIC_API_URL=http://localhost:8000/api
 */

import type {
  AuthResponse,
  Complaint,
  CreateComplaintDto,
  LoginDto,
  MonthlyReport,
  RegisterDto,
  UpdateComplaintDto,
  User,
} from "./types";
import {
  MOCK_ADMIN,
  MOCK_ADMIN_COMPLAINTS,
  MOCK_CITIZEN,
  MOCK_COMPLAINTS,
  MOCK_MONTHLY_REPORT,
} from "./mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

function mockId() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function isoNow() {
  return new Date().toISOString();
}

// --- Auth ---------------------------------------------------------------------

/**
 * Authenticate a user.
 * TODO: POST ${API_BASE}/auth/login  { email, password }
 */
export async function login(dto: LoginDto): Promise<AuthResponse> {
  void API_BASE;
  await Promise.resolve();
  const user: User = dto.role === "admin" ? MOCK_ADMIN : MOCK_CITIZEN;
  return { token: "mock-jwt-token", user };
}

/**
 * Register a new citizen.
 * TODO: POST ${API_BASE}/auth/register  { username, email, password, location_assigned }
 */
export async function register(dto: RegisterDto): Promise<AuthResponse> {
  void API_BASE;
  await Promise.resolve();
  const user: User = {
    id: mockId(),
    username: dto.username,
    email_address: dto.email,
    location_assigned: dto.location_assigned ?? "",
    role_id: 1,
    role: "citizen",
  };
  return { token: "mock-jwt-token", user };
}

// --- Complaints (citizen) -----------------------------------------------------

/**
 * Get all complaints filed by the current citizen.
 * TODO: GET ${API_BASE}/complaints/my  (Bearer token)
 */
export async function getMyComplaints(_token?: string): Promise<Complaint[]> {
  await Promise.resolve();
  return MOCK_COMPLAINTS;
}

/**
 * Get a single complaint by ID (citizen view).
 * TODO: GET ${API_BASE}/complaints/${id}  (Bearer token)
 */
export async function getComplaint(
  id: string,
  _token?: string,
): Promise<Complaint | null> {
  await Promise.resolve();
  return MOCK_COMPLAINTS.find((c) => c.id === id) ?? null;
}

/**
 * File a new complaint.
 * TODO: POST ${API_BASE}/complaints  body: CreateComplaintDto  (Bearer token)
 */
export async function createComplaint(
  dto: CreateComplaintDto,
  _token?: string,
): Promise<Complaint> {
  await Promise.resolve();
  const now = isoNow();
  return {
    id: mockId(),
    user_id: MOCK_CITIZEN.id,
    citizenName: MOCK_CITIZEN.username,
    email_address: MOCK_CITIZEN.email_address,
    location: dto.location,
    lat: dto.lat,
    lng: dto.lng,
    description: dto.description,
    tagging: dto.tagging,
    priority: dto.priority ?? "medium",
    media: dto.media,
    title: dto.title,
    status: "pending",
    created_at: now,
    updated_at: now,
  };
}

/**
 * Close a complaint (citizen action, only when status is "resolved").
 * TODO: PATCH ${API_BASE}/complaints/${id}/close  (Bearer token)
 */
export async function closeComplaint(
  id: string,
  _token?: string,
): Promise<Complaint> {
  await Promise.resolve();
  const complaint = MOCK_COMPLAINTS.find((c) => c.id === id);
  if (!complaint) throw new Error("Complaint not found");
  return { ...complaint, status: "closed", updated_at: isoNow() };
}

// --- Complaints (admin) -------------------------------------------------------

/**
 * Get all complaints assigned to the current admin.
 * TODO: GET ${API_BASE}/admin/complaints  (Bearer token)
 */
export async function getAdminComplaints(
  _token?: string,
): Promise<Complaint[]> {
  await Promise.resolve();
  return MOCK_ADMIN_COMPLAINTS;
}

/**
 * Get a single complaint (admin view).
 * TODO: GET ${API_BASE}/admin/complaints/${id}  (Bearer token)
 */
export async function getAdminComplaint(
  id: string,
  _token?: string,
): Promise<Complaint | null> {
  await Promise.resolve();
  return MOCK_ADMIN_COMPLAINTS.find((c) => c.id === id) ?? null;
}

/**
 * Update a complaint status / comment / assignment.
 * TODO: PATCH ${API_BASE}/admin/complaints/${id}  body: UpdateComplaintDto  (Bearer token)
 */
export async function updateComplaint(
  id: string,
  dto: UpdateComplaintDto,
  _token?: string,
): Promise<Complaint> {
  await Promise.resolve();
  const complaint = MOCK_ADMIN_COMPLAINTS.find((c) => c.id === id);
  if (!complaint) throw new Error("Complaint not found");
  return { ...complaint, ...dto, updated_at: isoNow() };
}

// --- Monthly reports (AI-generated) ------------------------------------------

/**
 * Get the latest monthly summary report.
 * TODO: GET ${API_BASE}/reports/latest  (Bearer token)
 */
export async function getMonthlyReport(
  _token?: string,
): Promise<MonthlyReport> {
  await Promise.resolve();
  return MOCK_MONTHLY_REPORT;
}

/**
 * Get all complaints with coordinates for the shared map.
 * TODO: GET ${API_BASE}/reports/map  (Bearer token)
 */
export async function getMapData(_token?: string): Promise<Complaint[]> {
  await Promise.resolve();
  const all = [...MOCK_COMPLAINTS, ...MOCK_ADMIN_COMPLAINTS];
  const seen = new Set<string>();
  return all.filter((c) => {
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return c.lat != null && c.lng != null;
  });
}
