// --- Domain types ------------------------------------------------------------
// Field names match the FastAPI / SQLite backend schema.

export type ReportStatus =
  | "pending"
  | "under-review"
  | "in-progress"
  | "resolved"
  | "closed";
export type Priority = "low" | "medium" | "high";
export type UserRole = "citizen" | "admin";

// Maps to the `complaints` table
export interface Complaint {
  id: string;
  user_id: string;
  // joined from users table — not a DB column on complaints
  citizenName?: string;
  location: string; // address / zone free-text
  lng?: number; // decimal
  lat?: number; // decimal
  email_address: string;
  status: ReportStatus;
  description: string;
  priority: Priority;
  media?: string; // file path / URL
  tagging: string; // category tag
  created_at: string; // ISO datetime
  updated_at: string;
  // assigned_admin_id FK — stored as int in DB, string in FE
  assigned_admin_id?: string;
  // joined from users table on GET — not stored on complaints
  adminName?: string;
  adminComment?: string;
  adminCommentDate?: string;
  // frontend-only convenience alias (not a DB column)
  adminId?: string; // alias for assigned_admin_id
  title?: string; // short summary shown in FE (not a DB column)
}

// Maps to the `users` table
export interface User {
  id: string;
  username: string;
  email_address: string;
  location_assigned: string;
  role_id: number; // 1 = citizen, 2 = admin
  role: UserRole; // resolved label for convenience
  created_at?: string;
  // admin-only
  zones?: string[];
}

// Maps to the `reports` table (AI-generated monthly summary)
export interface MonthlyReport {
  id: string;
  month: string; // datetime
  overall_complaint_count: number;
  overall_completion_rate: number; // percentage 0�100
  forecast: string;
  suggest_actions: string;
  created_at: string;
}

// --- Request DTOs -------------------------------------------------------------

export interface CreateComplaintDto {
  location: string;
  description: string;
  tagging: string;
  priority?: Priority;
  lng?: number;
  lat?: number;
  media?: string;
  // frontend-only summary, BE may ignore
  title?: string;
}

export interface UpdateComplaintDto {
  status?: ReportStatus;
  adminComment?: string;
  // maps to complaints.assigned_admin_id
  assigned_admin_id?: string;
}

export interface LoginDto {
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  location_assigned?: string;
}

// --- Response types -----------------------------------------------------------

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  detail?: string;
}
