import type { Complaint, User, MonthlyReport } from "./types";

// --- Mock users ---------------------------------------------------------------

export const MOCK_CITIZEN: User = {
  id: "1",
  username: "juandelacruz",
  email_address: "juan@example.com",
  location_assigned: "Purok 3, Brgy. San Isidro",
  role_id: 1,
  role: "citizen",
};

export const MOCK_ADMIN: User = {
  id: "2",
  username: "admin1",
  email_address: "admin1@alalai.brgy",
  location_assigned: "Barangay Hall, Brgy. San Isidro",
  role_id: 2,
  role: "admin",
  zones: ["A", "B", "C"],
};

// --- Mock complaints ----------------------------------------------------------

export const MOCK_COMPLAINTS: Complaint[] = [
  {
    id: "2341",
    user_id: "1",
    citizenName: "Juan dela Cruz",
    email_address: "juan@example.com",
    title: "Broken streetlight near Purok 3",
    tagging: "Infrastructure",
    location: "Purok 3, near the basketball court, Brgy. San Isidro",
    lat: 14.5991,
    lng: 120.9828,
    description:
      "The streetlight at the corner of Purok 3 near the basketball court has been broken for over two weeks. Residents are unable to walk safely at night.",
    status: "in-progress",
    priority: "high",
    media:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    created_at: "2026-04-30T08:00:00Z",
    updated_at: "2026-05-01T10:00:00Z",
    adminId: "2",
    adminName: "Admin 1",
    adminComment:
      "This report is now ongoing but may take more than 2 days due to procurement of replacement parts.",
    adminCommentDate: "2026-05-01",
  },
  {
    id: "2198",
    user_id: "1",
    citizenName: "Juan dela Cruz",
    email_address: "juan@example.com",
    title: "Illegal dumping beside the canal",
    tagging: "Environment",
    location: "Near Canal A, Purok 1, Brgy. San Isidro",
    lat: 14.6008,
    lng: 120.9824,
    description:
      "Large pile of garbage illegally dumped beside the main canal causing foul odor and drainage blockage risk.",
    status: "resolved",
    priority: "medium",
    created_at: "2026-04-22T09:00:00Z",
    updated_at: "2026-04-25T14:00:00Z",
    adminId: "2",
    adminName: "Admin 1",
    adminComment: "Issue has been addressed. Area has been cleaned.",
    adminCommentDate: "2026-04-25",
  },
  {
    id: "2087",
    user_id: "1",
    citizenName: "Juan dela Cruz",
    email_address: "juan@example.com",
    title: "Stray dogs in the playground",
    tagging: "Public Safety",
    location: "Barangay Playground, Zone B, Brgy. San Isidro",
    lat: 14.5975,
    lng: 120.9836,
    description:
      "Multiple stray dogs spotted in the playground, posing a risk to children. Some appear aggressive.",
    status: "pending",
    priority: "high",
    created_at: "2026-04-18T07:30:00Z",
    updated_at: "2026-04-18T07:30:00Z",
  },
  {
    id: "2412",
    user_id: "1",
    citizenName: "Juan dela Cruz",
    email_address: "juan@example.com",
    title: "Flooded drainage near Purok 5",
    tagging: "Flooding",
    location: "Purok 5, main road, Brgy. San Isidro",
    lat: 14.5984,
    lng: 120.9854,
    description:
      "The drainage along Purok 5 has been clogged and overflows during rain, flooding the main road.",
    status: "under-review",
    priority: "medium",
    created_at: "2026-05-03T11:00:00Z",
    updated_at: "2026-05-04T08:00:00Z",
    adminId: "2",
    adminName: "Admin 1",
    adminComment:
      "We are currently assessing the extent of the drainage blockage before dispatching a team.",
    adminCommentDate: "2026-05-04",
  },
];

// --- Admin assigned complaints (superset) ------------------------------------

export const MOCK_ADMIN_COMPLAINTS: Complaint[] = [
  ...MOCK_COMPLAINTS,
  {
    id: "5698",
    user_id: "3",
    citizenName: "Maria Santos",
    email_address: "maria@example.com",
    title: "Illegal dumping on Maharlika St.",
    tagging: "Environment",
    location: "Maharlika St., Zone B, Brgy. San Isidro",
    lat: 14.5997,
    lng: 120.9862,
    description: "Residents dumping trash directly on the street.",
    status: "pending",
    priority: "medium",
    media:
      "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80",
    created_at: "2026-05-01T06:00:00Z",
    updated_at: "2026-05-01T06:00:00Z",
    adminId: "2",
    adminName: "Admin 1",
  },
  {
    id: "2152",
    user_id: "4",
    citizenName: "Pedro Reyes",
    email_address: "pedro@example.com",
    title: "Pothole causing accidents",
    tagging: "Infrastructure",
    location: "Zone C, near market, Brgy. San Isidro",
    lat: 14.5963,
    lng: 120.9845,
    description: "Large pothole causing vehicle damage and accidents.",
    status: "resolved",
    priority: "high",
    created_at: "2026-04-25T08:00:00Z",
    updated_at: "2026-04-28T12:00:00Z",
    adminId: "2",
    adminName: "Admin 1",
    adminComment: "Road has been repaired by DPWH coordination.",
    adminCommentDate: "2026-04-28",
  },
];

// --- Mock monthly report (AI-generated) --------------------------------------

export const MOCK_MONTHLY_REPORT: MonthlyReport = {
  id: "1",
  month: "2026-04-01T00:00:00Z",
  overall_complaint_count: 8,
  overall_completion_rate: 75,
  forecast: "Increase in infrastructure complaints expected in May.",
  suggest_actions:
    "Prioritize road repair teams for Zone C; schedule canal cleanup for Zone B.",
  created_at: "2026-05-01T00:00:00Z",
};
