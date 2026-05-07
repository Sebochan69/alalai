# AlalAI

AlalAI is an AI-assisted barangay complaint management system. Citizens can file concerns, attach photo evidence, track complaint status, and ask a barangay chatbot for help. Admins can manage assigned complaints, update statuses, view maps, and generate monthly AI-assisted reports.

This project was built as a hackathon/demo application for a single barangay workflow.

## Features

- Citizen and admin authentication
- Citizen complaint filing with location, description, and optional photo upload
- Supabase Storage integration for complaint photos
- AI complaint tagging, priority classification, summary, duplicate detection, and admin assignment
- Admin complaint queue and status updates
- Complaint map views
- Monthly report generation with AI forecast and suggested actions
- Chatbot backed by mock barangay knowledge data
- Demo chatbot complaint-status lookup using hardcoded mock complaint records

## Tech Stack

### Backend

- FastAPI
- SQLAlchemy
- PostgreSQL/Supabase or SQLite for local fallback
- OpenAI/LangChain
- Supabase Storage
- JWT authentication

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn-style UI components
- Leaflet/MapLibre map components

## Project Structure

```text
alalai/
+-- backend/
|   +-- app/
|   |   +-- api/routes/        # FastAPI route modules
|   |   +-- core/              # Config, constants, security
|   |   +-- db/                # SQLAlchemy models and session
|   |   +-- prompts/           # AI prompt files
|   |   +-- schemas/           # Pydantic schemas
|   |   +-- seed/              # Mock barangay knowledge base
|   |   +-- services/          # AI, reports, storage, and shared business logic
|   +-- tests/
|   +-- pyproject.toml
|   +-- requirements.txt
+-- frontend/
|   +-- app/                   # Next.js app routes
|   +-- components/
|   +-- lib/
|   +-- public/
|   +-- package.json
+-- docs/
```

## Backend Setup

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Edit `backend/.env` with your real credentials.

```env
DATABASE_URL=postgresql://...

SECRET_KEY=change-this
JWT_SECRET_KEY=change-this
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15

OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.4-mini
OPENAI_TEMPERATURE=0

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=complaint-photos

FRONTEND_URL=http://localhost:3000
```

Run the backend:

```bash
uvicorn app.main:app --reload
```

API docs:

```text
http://localhost:8000/docs
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App URL:

```text
http://localhost:3000
```

The frontend uses `NEXT_PUBLIC_API_URL` when configured. It should point to the backend API prefix, for example:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Supabase Photo Uploads

Complaint photos are uploaded by the backend to Supabase Storage.

Create a Supabase Storage bucket named:

```text
complaint-photos
```

Then set:

```env
SUPABASE_STORAGE_BUCKET=complaint-photos
```

Allowed photo formats:

- JPG/JPEG
- PNG
- WEBP

For demo use, the bucket can be public so stored photo URLs can be displayed directly in the frontend. For safer backend uploads, set `SUPABASE_SERVICE_ROLE_KEY` in the backend environment. If only the anon key is used, Supabase Storage policies must allow inserts into the selected bucket.

## Core API Endpoints

### Auth

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Complaints / Reports

File a complaint:

```http
POST /api/reports/
```

Form data:

```text
address
description
latitude optional
longitude optional
photo optional
```

Get citizen's reports:

```http
GET /api/reports/mine
```

Get assigned admin reports:

```http
GET /api/reports/assigned
```

Update complaint status:

```http
PATCH /api/reports/{report_id}/status
```

Body:

```json
{
  "status": "in-progress",
  "admin_comment": "Optional admin note"
}
```

Supported complaint statuses:

```text
pending
in-progress
for-review
resolved
```

Supported priority levels:

```text
low
medium
high
urgent
```

### Monthly Reports

Generate a monthly report:

```http
POST /api/reports/monthly/{YYYY-MM}
```

Get one monthly report:

```http
GET /api/reports/monthly/{YYYY-MM}
```

Get all monthly reports:

```http
GET /api/reports/monthly
```

Monthly reports are not generated automatically. An admin or scheduled job must call the `POST` endpoint first.

### Chatbot

```http
POST /api/chat/
```

Body:

```json
{
  "message": "What is the status of my complaint?"
}
```

The chatbot reads from:

```text
backend/app/seed/barangay_info_mock.md
```

Demo complaint status IDs:

```text
1001
1002
1003
```

If the user asks for "my complaint status" without giving an ID, the chatbot returns the default demo complaint `1001`.

## Test Accounts

Citizen:

```text
Email: smilebigsun@yahoo.com
Password: sebo123
```

Admin:

```text
Email: dianecoding@gmail.com
Password: diane123
```

## Status Updates

Status update payload only needs:

```json
{
  "status": "for-review",
  "admin_comment": "The issue has been addressed. Please confirm."
}
```

## AI Behavior

When a complaint is filed, the backend:

1. Runs AI tagging and summary generation.
2. Assigns a priority level.
3. Checks for possible duplicates.
4. Auto-assigns the complaint to an admin based on location/workload.
5. Saves the complaint.

Monthly report generation calculates deterministic metrics first, then asks AI for forecast and suggested actions.

## Tests

Run backend tests:

```bash
cd backend
.\.venv\Scripts\python.exe -m unittest discover tests
```

Run frontend lint:

```bash
cd frontend
npm run lint
```

## Demo Notes

- The app is scoped for a single barangay demo.
- The chatbot knowledge base is mock data.
- Monthly reports must be generated manually through the backend endpoint.
- Supabase bucket/policies must be configured before photo upload works.
- Keep real `.env` secrets out of commits.
