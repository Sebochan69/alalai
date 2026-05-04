# AlalAI 2-Day GitHub Ticket Plan

The GitHub connector could not create issues because the repository integration returned `403 Resource not accessible by integration`. Use this file as the source of truth for creating/importing tickets.

Team:
- 1 frontend engineer
- 1 backend engineer
- 2 AI engineers who can also support backend

Strict timeline:
- Day 1: lock backend contracts, AI tagging, AI assignment, citizen/admin core flows
- Day 2: shared map, analytics, seed data, integration, demo freeze

## Ticket 1: [Day 1][BE] Finalize complaint lifecycle, report schema, and API contracts

### Goal
Finalize the backend contract that every other feature depends on: complaint creation, AI-processed complaint storage, status lifecycle, citizen/admin permissions, and shared map data.

### Owner
Backend engineer. AI engineers can support validation around AI payload shape.

### Context
The project workflow is:
1. Citizen files a complaint.
2. Complaint is created with `pending` status.
3. Backend synchronously runs AI tagging first.
4. Backend then runs AI assignment second.
5. The complaint row is updated with the AI-processed result.
6. Assigned admin handles the complaint.
7. Citizen confirms final resolution.

Admins remain seeded users. Admin registration is intentionally out of scope.

### Required Status Lifecycle
Use exactly these statuses across backend and frontend:
- `pending`
- `in progress`
- `for review`
- `resolved`

Expected transitions:
- New complaint: `pending`
- Admin starts work: `pending` -> `in progress`
- Admin says issue is ready for citizen review: `in progress` or `pending` -> `for review`
- Citizen confirms: `for review` -> `resolved`

### Required Backend Behavior
- Citizen can create complaints.
- Citizen can only update their own complaint from `for review` to `resolved`.
- Admin can only update complaints assigned to them.
- Admin cannot mark a complaint as `resolved`; that is citizen-owned.
- Map data endpoint must be accessible to both `citizen` and `admin` authenticated users.
- Existing seeded admins must retain `assigned_locations`.

### Information Needed
- Current authenticated user: role and user id.
- Complaint form data: address, description, optional latitude, optional longitude, optional photo.
- Admin list: id, full name, assigned locations, active report count.
- Status update payload: target status and optional admin comment.

### Information This Provides
- A stable report object for frontend screens.
- A stable AI-processed complaint payload for integration.
- A shared status contract for dashboard counts, badges, and admin controls.
- A shared map data contract for citizen and admin users.

### API Contract Needed
`POST /api/reports/`
- Input: `address`, `description`, optional `latitude`, optional `longitude`, optional `photo`
- Output: report object including AI fields and status.

`GET /api/reports/mine`
- Citizen dashboard and detail page source.

`GET /api/reports/assigned`
- Admin assigned complaint list source.

`PATCH /api/reports/{id}/status`
- Used by admin and citizen status actions.

`GET /api/reports/map`
- Shared map endpoint for both roles. Returns only reports with coordinates.

### Integration Points
- FE citizen filing depends on `POST /api/reports/`.
- FE admin report management depends on `GET /api/reports/assigned` and status patching.
- FE citizen confirmation depends on status patching accepting `resolved` only from `for review`.
- FE map depends on `GET /api/reports/map`.
- AI tagging and AI assignment tickets depend on the payload shape stored in `ai_processed_complaint`.
- Analytics depends on final status values and report timestamps.

### Acceptance Criteria
- Complaint creation runs AI tagging then AI assignment synchronously.
- New complaints are saved as `pending`.
- `ai_processed_complaint` is stored on the complaint/report row.
- Invalid statuses are rejected.
- Citizen cannot update another citizen's complaint.
- Citizen cannot resolve unless status is `for review`.
- Admin cannot resolve directly.
- Shared map endpoint works for both user roles.
- Backend compile/check passes.

## Ticket 2: [Day 1][AI-1] Build and validate AI complaint tagging output

### Goal
Make the first AI process reliable enough for demo: classify the complaint, determine priority, summarize it, and extract a usable location area.

### Owner
AI engineer 1. Backend engineer should review the output contract.

### Context
This is the first AI step in the complaint pipeline. It runs immediately after a citizen submits a complaint and before assignment happens.

Pipeline position:
Citizen complaint -> AI tagging -> AI assignment -> saved AI-processed complaint -> admin workflow.

### Information Needed
Input to AI tagging:
- `description`: citizen-written complaint text.
- `address`: citizen-provided address or area.

Allowed tags:
- `garbage`
- `flooding`
- `noise`
- `road_damage`
- `illegal_parking`
- `vandalism`
- `street_light`
- `other`

Priority levels:
- `low`
- `medium`
- `high`
- `urgent`

### Information This Provides
Output from AI tagging must provide:
- `tag`: one allowed complaint category.
- `priority`: one allowed priority level.
- `location_area`: extracted area/zone/purok used by assignment.
- `summary`: short summary shown to admins/citizens and used in analytics.

Example output:
```json
{
  "tag": "garbage",
  "priority": "medium",
  "location_area": "Zone 1",
  "summary": "Uncollected garbage near the corner of Zone 1 causing odor and obstruction."
}
```

### Integration Points
- Backend `POST /api/reports/` calls this first.
- AI assignment depends on `location_area` from this output.
- Admin report list displays `tag`, `priority`, and `ai_summary`.
- Dashboard analytics depends on accurate `tag`, `priority`, and `location_area`.
- Map popup uses `tag`, `priority`, `status`, and `summary`.

### Prompt Requirements
- Force JSON-only output.
- Never return unsupported tags or priorities.
- If location is unclear, return `null` or best-effort from address.
- If the complaint is ambiguous, use `other` rather than inventing a new tag.
- Summary should be concise and citizen/admin friendly.

### Test Cases Needed
Create or document at least 8 demo examples:
- Garbage collection issue.
- Flooding/drainage issue.
- Noise complaint.
- Road damage.
- Illegal parking.
- Vandalism.
- Broken street light.
- Ambiguous complaint that should become `other`.

### Acceptance Criteria
- Output parses as valid JSON.
- Output keys are stable: `tag`, `priority`, `location_area`, `summary`.
- All tags and priorities are within allowed lists.
- At least 8 sample complaints produce reasonable outputs.
- Backend fallback behavior still works if AI returns bad data.

## Ticket 3: [Day 1][AI-2] Build AI admin assignment logic using location and workload

### Goal
Make the second AI process assign each AI-tagged complaint to the correct seeded admin based on extracted location and current workload.

### Owner
AI engineer 2. Backend engineer can support query and payload wiring.

### Context
This is the second AI step in the complaint pipeline. It must run after AI tagging because it depends on the `location_area` extracted by the tagging process.

Pipeline position:
Citizen complaint -> AI tagging -> AI assignment -> saved AI-processed complaint -> admin workflow.

Admins are seeded users, not self-registered users. Each admin has `assigned_locations`.

### Information Needed
Input to AI assignment:
- `location_area`: produced by AI tagging.
- `admins`: list of candidate admins.

Each admin candidate should include:
- `id`
- `full_name`
- `assigned_locations`
- `active_reports`

Example input:
```json
{
  "location_area": "Zone 1",
  "admins": [
    {
      "id": 1,
      "full_name": "Admin Zone A",
      "assigned_locations": "A,Zone 1,Purok 1",
      "active_reports": 2
    }
  ]
}
```

### Information This Provides
Output from AI assignment must provide:
- `admin_id`: selected seeded admin id.
- `dispatch_reason`: short explanation for why this admin was selected.

Example output:
```json
{
  "admin_id": 1,
  "dispatch_reason": "Assigned to Admin Zone A because Zone 1 is listed in their assigned locations."
}
```

### Integration Points
- Backend report creation calls this after AI tagging.
- Result is stored in `assigned_admin_id` and `dispatch_reason`.
- Full assignment output is included in `ai_processed_complaint`.
- Admin assigned reports page depends on `assigned_admin_id`.
- Notifications are sent to the chosen admin.
- Analytics can later use admin workload and performance data.

### Assignment Rules
- Prefer admins whose `assigned_locations` match `location_area`.
- If multiple admins match, prefer lower `active_reports`.
- If no admin matches, choose the least-loaded admin as fallback.
- If no admins exist, return `admin_id: null` with an explanatory `dispatch_reason`.
- Never return an admin id outside the provided candidates.

### Test Cases Needed
- Exact location match.
- Case-insensitive location match.
- Multiple admins match, lower workload wins.
- No location match, least workload fallback.
- Missing or unclear location.
- No admin candidates.

### Acceptance Criteria
- Output parses as valid JSON.
- Output keys are stable: `admin_id`, `dispatch_reason`.
- Returned `admin_id` is either null or one of the candidate admin ids.
- Demo data assigns complaints to expected seeded admins.
- Backend fallback protects against malformed AI output.

## Ticket 4: [Day 1][FE] Citizen complaint flow and resolution confirmation

### Goal
Build the citizen-facing workflow from registration/login through complaint filing, tracking, and final resolution confirmation.

### Owner
Frontend engineer.

### Context
Citizens are the source of complaints. Their submitted complaint triggers the full AI pipeline on the backend.

Citizen flow:
1. Citizen logs in or registers.
2. Citizen files a complaint.
3. Backend creates complaint as `pending` and runs AI processing.
4. Citizen sees their complaints in dashboard.
5. When admin marks a complaint `for review`, citizen can mark it `resolved`.

### Information Needed
From citizen form:
- `address`
- `description`
- optional `latitude`
- optional `longitude`
- optional photo if supported in UI

From backend report response:
- `id`
- `address`
- `description`
- `tag`
- `priority`
- `ai_summary`
- `status`
- `admin_comment`
- `created_at`

### Information This Provides
To backend:
- Complaint details used by AI tagging.
- Address/location data used by AI assignment and map markers.

To citizen:
- Confirmation that complaint was filed.
- AI-generated summary/category/priority.
- Current complaint status.
- Admin comment and final review action.

### Screens Needed
- Login/register flow should remain usable.
- Citizen dashboard: list citizen's own complaints.
- File complaint page: submit complaint to backend.
- Report detail page: show full complaint details and status.
- Show `Mark as Resolved` only when status is `for review`.

### API Dependencies
- `POST /api/reports/`
- `GET /api/reports/mine`
- `PATCH /api/reports/{id}/status`

### Integration Points
- Filing page depends on backend report creation and AI pipeline.
- Dashboard depends on stable report output fields.
- Status badge must use exact status strings shared with backend.
- Resolution button depends on backend rule: citizen can update `for review` -> `resolved` only.
- Dashboard metrics and admin pages depend on citizen final confirmation to count resolved reports correctly.

### Acceptance Criteria
- Citizen can submit a complaint and return to dashboard.
- Dashboard shows complaint summary, tag, priority, and status.
- Report detail shows full complaint data and admin comment.
- Citizen sees resolve button only for `for review` complaints.
- Clicking resolve updates status to `resolved`.
- UI uses exact status labels: `pending`, `in progress`, `for review`, `resolved`.
- Basic error states are shown for failed submit/update calls.

## Ticket 5: [Day 1][FE+BE] Admin assigned complaints workflow

### Goal
Build the admin workflow for viewing AI-assigned complaints and updating their status through the agreed lifecycle.

### Owner
Frontend engineer for UI. Backend engineer for endpoint rules. AI engineers can help validate AI assignment data shown in the UI.

### Context
Admins are seeded users with assigned locations. The AI assignment process chooses which admin receives a complaint. Admins then manage only their assigned complaints.

Admin flow:
1. Admin logs in.
2. Admin opens assigned complaints page.
3. Admin sees complaints assigned by AI.
4. Admin updates complaint to `in progress` when work begins.
5. Admin updates complaint to `for review` when ready for citizen confirmation.
6. Citizen marks it `resolved`.

### Information Needed
From backend assigned report list:
- `id`
- `address`
- `description`
- `location_area`
- `tag`
- `priority`
- `ai_summary`
- `dispatch_reason`
- `possible_duplicate_report_id`
- `status`
- `admin_comment`
- `created_at`

From admin action:
- target `status`
- optional `admin_comment`

### Information This Provides
To admin:
- Which complaints are assigned to them.
- Why AI assigned the complaint to them.
- Complaint category, priority, and summary for fast triage.
- Status controls for operational progress.

To citizen:
- Status movement and optional admin comment.
- Notification when complaint reaches `for review`.

### API Dependencies
- `GET /api/reports/assigned`
- `PATCH /api/reports/{id}/status`

### Integration Points
- Depends on AI assignment setting `assigned_admin_id`.
- Depends on AI tagging for `tag`, `priority`, `location_area`, and `ai_summary`.
- Citizen report detail depends on admin setting `for review`.
- Analytics dashboard depends on status updates.
- Notification system should alert citizen when status becomes `for review`.

### UI Requirements
- Assigned reports list grouped or sorted by newest first.
- Clearly show status badge.
- Show `tag`, `priority`, address, and summary.
- Include status control with valid admin options only:
  - `pending`
  - `in progress`
  - `for review`
- Do not allow admin to mark directly as `resolved`.
- Optional: allow admin comment field before moving to `for review`.

### Acceptance Criteria
- Admin sees only assigned complaints.
- Admin can update status to `in progress`.
- Admin can update status to `for review`.
- Admin cannot set status to `resolved`.
- Citizen receives or can see that report is ready for review.
- UI reflects status updates after patching.

## Ticket 6: [Day 2][FE+BE] Shared complaint map for citizens and admins

### Goal
Make the complaint map accessible to both citizens and admins, with markers for reports that have coordinates.

### Owner
Frontend engineer primarily. Backend engineer for endpoint access and data shape.

### Context
The map is a shared visibility feature. Both user types should be able to view complaint markers. This is not admin-only.

Map flow:
1. Authenticated user opens `/map`.
2. Frontend calls shared map endpoint.
3. Backend returns geocoded complaints with latitude/longitude.
4. Map renders markers with complaint details.

### Information Needed
From backend:
- `id`
- `address`
- `latitude`
- `longitude`
- `tag`
- `priority`
- `status`
- `summary`

From frontend/app config:
- default map center latitude
- default map center longitude
- default zoom

### Information This Provides
To citizens and admins:
- Geographic view of complaint reports.
- Status/category context per marker.
- Basic hotspot visibility for demo.

To analytics:
- Validates that location data is being captured well enough to support hotspot reporting.

### API Dependency
- `GET /api/reports/map`

### Integration Points
- Complaint filing must capture optional latitude/longitude or provide a location path for demo seed data.
- AI tagging provides `location_area`, which complements map coordinates.
- Dashboard analytics can use the same location/area concepts for hotspots.
- Navigation must expose map link to both citizens and admins.

### UI Requirements
- Route should be `/map` for both roles.
- Existing `/admin/map` can redirect to `/map` if needed.
- Citizen navbar should include Map.
- Admin navbar should include Map.
- Marker popup should show report id, tag, summary, and status.
- Empty state should be understandable if no reports have coordinates.

### Acceptance Criteria
- Citizen can access map after login.
- Admin can access map after login.
- Unauthenticated users are redirected to login.
- Markers render for reports with coordinates.
- Reports without coordinates do not break the map.
- Map endpoint does not require admin role.

## Ticket 7: [Day 2][AI+BE] AI-generated admin performance analytics dashboard data

### Goal
Generate useful admin/report analytics for the dashboard, including complaint totals, status counts, issue patterns, hotspot areas, and admin performance insights.

### Owner
AI engineers own prompt/report quality. Backend engineer owns endpoint and data aggregation. Frontend engineer consumes the final shape.

### Context
The dashboard must help barangay admins understand operational performance and complaint trends. This is also a demo-critical page.

Dashboard must show analytics for:
- total complaints
- pending complaints
- in progress complaints
- for review complaints
- resolved complaints
- common complaint types
- hotspot areas
- suggested actions
- admin performance where data allows

### Information Needed
From reports:
- `id`
- `tag`
- `priority`
- `location_area`
- `status`
- `created_at`
- `updated_at`
- `assigned_admin_id`
- `ai_summary`

From users/admins if available:
- admin id
- admin full name
- assigned locations

Derived backend metrics:
- total complaint count
- counts by status
- counts by tag
- counts by location area
- average time from created to for review/resolved if timestamps allow
- active report count per admin

### Information This Provides
To frontend dashboard:
- numeric metric cards
- chart data for top issues
- AI narrative summary
- hotspot areas
- suggested actions
- performance notes per admin if available

To project demo:
- clear proof that AI is not only tagging/assigning but also helping management make decisions.

### API Dependency
- `GET /api/admin/analytics`

### Suggested Output Shape
```json
{
  "total_complaints": 10,
  "status_counts": {
    "pending": 2,
    "in progress": 3,
    "for review": 1,
    "resolved": 4
  },
  "summary": "Complaint volume is concentrated around garbage and flooding issues.",
  "top_issues": [
    { "tag": "garbage", "count": 4 },
    { "tag": "flooding", "count": 3 }
  ],
  "hotspot_areas": ["Zone 1", "Purok 2"],
  "suggested_actions": ["Prioritize drainage inspection in Zone 1."],
  "admin_performance": [
    {
      "admin_id": 1,
      "admin_name": "Admin Zone A",
      "assigned": 5,
      "resolved": 3,
      "active": 2,
      "notes": "Most assigned reports are garbage-related."
    }
  ],
  "forecast": "Garbage complaints may increase if collection delays continue.",
  "sla_issues": []
}
```

### Integration Points
- Depends on backend status lifecycle being final.
- Depends on AI tagging quality for `tag` and `location_area`.
- Depends on AI assignment/admin ownership for performance metrics.
- FE dashboard consumes `total_complaints`, `status_counts`, `top_issues`, `hotspot_areas`, `suggested_actions`, and narrative fields.
- Demo seed data should include enough reports across statuses to make charts meaningful.

### Acceptance Criteria
- Endpoint returns both deterministic counts and AI-generated narrative insights.
- Status counts use exact lifecycle labels.
- Top issues are chart-ready.
- Hotspot areas are human-readable.
- Admin performance section is included if admin/report data is available.
- Prompt output handles low-data scenarios gracefully.

## Ticket 8: [Day 2][All] Final integration, demo seed data, and smoke test checklist

### Goal
Use this as the final 2-day integration checklist so the team can demo the complete system end-to-end without surprises.

### Owner
All. Backend engineer coordinates API readiness. Frontend engineer coordinates UI demo path. AI engineers coordinate prompt output quality and sample data.

### Demo Story
1. Citizen logs in.
2. Citizen files a complaint.
3. Backend creates complaint as `pending`.
4. AI tagging assigns category, priority, summary, and location area.
5. AI assignment selects seeded admin based on location/workload.
6. Admin receives/sees assigned complaint.
7. Admin updates complaint to `in progress`.
8. Admin updates complaint to `for review` with optional comment.
9. Citizen reviews and marks complaint as `resolved`.
10. Both user types can view complaint map.
11. Admin dashboard shows totals, statuses, issue patterns, hotspots, and AI-generated insights.

### Information Needed Before Final Demo
Environment:
- Backend `.env` with valid OpenAI API key.
- Frontend `.env` pointing to backend API URL.
- Seeded admin accounts and passwords.
- Demo citizen account and password.
- Database reset/seed instructions.

Demo data:
- At least 8-12 complaints.
- Complaints across all statuses: `pending`, `in progress`, `for review`, `resolved`.
- Complaints across several tags: garbage, flooding, road damage, street light, other.
- Complaints with latitude/longitude for map markers.
- Complaints spread across admin assigned locations.

### Information This Provides
- Confidence that each role can complete their workflow.
- Confidence that AI outputs integrate into backend persistence and frontend display.
- A reliable demo path for the presentation.
- Shared debugging checklist if something breaks.

### Integration Dependencies
- Backend report lifecycle ticket must be merged before final frontend status testing.
- AI tagging ticket must be working before complaint creation can produce useful summaries/tags.
- AI assignment ticket must be working before admin assigned report testing.
- Admin workflow ticket depends on assigned reports endpoint.
- Citizen flow ticket depends on report create/list/update endpoints.
- Map ticket depends on reports with coordinates.
- Analytics ticket depends on seed data and final status labels.

### Smoke Test Checklist
Authentication:
- Citizen can register/login.
- Admin seeded login works.
- Incorrect login fails cleanly.

Citizen:
- Citizen can file complaint.
- Citizen dashboard shows created complaint.
- Citizen can open report detail.
- Citizen cannot resolve until status is `for review`.
- Citizen can mark `for review` complaint as `resolved`.

AI:
- New complaint receives valid `tag`.
- New complaint receives valid `priority`.
- New complaint receives `ai_summary`.
- New complaint receives `location_area` when possible.
- New complaint receives assigned admin where admins exist.
- `ai_processed_complaint` is saved.

Admin:
- Admin sees only assigned reports.
- Admin can move report to `in progress`.
- Admin can move report to `for review`.
- Admin cannot mark report `resolved`.

Map:
- Citizen can access `/map`.
- Admin can access `/map`.
- Markers render for reports with coordinates.

Dashboard:
- Total complaints count is shown.
- Counts by status are shown.
- Top issues chart renders.
- Hotspot/suggested action sections render.
- AI analytics handles low-data cases.

### Suggested 2-Day Schedule
Day 1 morning:
- Backend contract finalization.
- AI tagging output contract.
- AI assignment output contract.

Day 1 afternoon:
- Citizen flow UI.
- Admin assigned reports UI.
- First end-to-end complaint creation test.

Day 2 morning:
- Shared map.
- Analytics/dashboard.
- Demo seed data.

Day 2 afternoon:
- Full smoke test.
- Fix integration bugs only.
- Freeze demo path.

### Acceptance Criteria
- One complete end-to-end complaint can be filed, AI-processed, assigned, worked, reviewed, and resolved.
- Dashboard reflects the final resolved state.
- Map is visible to both roles.
- Team has documented demo accounts and seed instructions.
- No unresolved blocker remains for the 2-day demo.
