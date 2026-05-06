// --- Domain types ------------------------------------------------------------
// Field names match the FastAPI / SQLite backend schema.

export type ReportStatus =
  | "pending"
  | "in-progress"
  | "for-review"
  | "resolved";
export type Priority = "low" | "medium" | "high";
export type UserRole = "citizen" | "admin";

// Maps to the `complaints` table
export interface Complaint {
  id: string;
  user_id: string;
  // joined from users table — not a DB column on complaints
  citizenName?: string;
  location: string; // address / zone free-text
  // DB columns: `long` (str) and `lat` (str) — mapped to numbers by API layer
  lng?: number;
  lat?: number;
  email_address: string; // FE-only: joined from users
  status: ReportStatus;
  description: string;
  priority: Priority;
  media?: string; // file path / URL (optional in DB)
  tagging: string; // category tag — set by AI
  created_at: string; // ISO datetime
  updated_at: string;
  date_resolved?: string; // datetime, set when status reaches resolved
  // DB column: `assigned` (int FK → users.id)
  assigned?: number;
  // FE-only: joined from users table on GET
  adminName?: string;
  // FE-only: joined from comments table on GET
  adminComment?: string;
  adminCommentDate?: string;
  title?: string; // FE display alias — not a DB column
  summary?: string; // DB column: `summary` — AI-generated summary
  location_area?: string; // AI-detected area label
}

// Maps to the `users` table
export interface User {
  id: string;
  username: string;
  email_address: string;
  location_assigned: string;
  role: UserRole;
  created_at?: string;
}

// Maps to the `comments` table
export interface Comment {
  id: string;
  user_id: string; // FK → users.id (the admin who commented)
  complaint_id?: string; // FK → complaints.id
  content: string;
  created_at: string;
}

// Maps to the `reports` table (AI-generated monthly summary)
export interface MonthlyReport {
  id: string;
  month: string; // "YYYY-MM" or ISO datetime
  overall_complaint_count: number;
  overall_completion_rate: number; // percentage 0-100
  forecast: string;
  suggest_actions: string[]; // array of action items
  avg_solution_days: number;
  // DB stores as JSON string — parsed to object by API layer
  category_breakdown: Record<string, number>;
  created_at?: string;
}

// --- Request DTOs -------------------------------------------------------------

export interface CreateComplaintDto {
  location: string;
  description: string;
  // `long` and `lat` match BE field names (stored as str, sent as number)
  long?: number;
  lat?: number;
  media?: File; // actual File object — sent as multipart/form-data to BE
}

export interface UpdateComplaintDto {
  status?: ReportStatus;
  // content maps to Comments.content — BE creates a Comment record
  adminComment?: string;
  // maps to complaints.assigned (int FK)
  assigned?: number;
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
