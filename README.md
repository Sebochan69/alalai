# AlalAI

AlalAI is an AI-assisted barangay complaint and resident support system. It lets citizens file local concerns, helps admins triage and update reports, shows complaint activity on dashboards and maps, and includes a barangay chatbot powered by a mock knowledge base.

This project was built as a proof of concept for a single-barangay workflow.

## What It Does

- Citizen login and report tracking
- Complaint filing with location, description, priority, and AI summary fields
- AI-assisted complaint tagging and admin assignment
- Admin report management and status updates
- Citizen confirmation flow for reports marked `for-review`
- Email notifications for complaint status changes
- Complaint map and dashboard views
- Monthly report and analytics support
- Barangay chatbot that answers from `backend/app/seed/barangay_info_mock.md`

## Tech Stack

Backend:

- FastAPI
- SQLAlchemy
- SQLite for local development
- PostgreSQL/Supabase-compatible database URL for deployment
- LangChain + OpenAI
- JWT auth

Frontend:

- Next.js
- React
- TypeScript
- Tailwind CSS
- MapLibre / Leaflet-related map components

## Project Structure

```text
backend/      FastAPI API, database models, services, prompts, seed scripts
frontend/     Next.js app and UI components
docs/         Planning and project notes
migrations/   Alembic migration files
```

## Requirements

- Python 3.14 or compatible project environment
- Node.js and npm
- An OpenAI API key for AI tagging, assignment, chatbot AI paths, and reports
- SQLite locally, or a PostgreSQL-compatible `DATABASE_URL` for deployment

## Backend Setup

From the repository root:

```bash
cd backend
```

Create or use the virtual environment:

```bash
python -m venv .venv
source .venv/Scripts/activate
```

On Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create your environment file:

```bash
cp .env.example .env
```

For local SQLite development, make sure `.env` includes:

```env
DATABASE_URL=sqlite:///./alalai.db
SECRET_KEY=change-this
JWT_SECRET_KEY=change-this
JWT_ALGORITHM=HS256
OPENAI_API_KEY=your-openai-api-key
FRONTEND_URL=http://localhost:3000
MAIL_USERNAME=your-gmail-address@gmail.com
MAIL_PASSWORD=your-16-character-gmail-app-password
MAIL_FROM=your-gmail-address@gmail.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
MAIL_STARTTLS=True
MAIL_SSL_TLS=False
```

Run the backend:

```bash
export DATABASE_URL='sqlite:///./alalai.db'
.venv/Scripts/python.exe -m uvicorn app.main:app --reload
```

API docs:

```text
http://127.0.0.1:8000/docs
```

Health check:

```bash
curl http://127.0.0.1:8000/
```

Expected response:

```json
{"app":"AlalAI","status":"running"}
```

## Seed Demo Data

To add demo users and sample complaints:

```bash
cd backend
export DATABASE_URL='sqlite:///./alalai.db'
.venv/Scripts/python.exe seed_users.py
```

Demo users from the seed script include:

```text
Citizen: smilebigsun@yahoo.com / sebo123
Admin:   dianecoding@gmail.com / diane123
```

## Test Backend Endpoints

Login as a citizen:

```bash
TOKEN=$(
  curl -s -X POST http://127.0.0.1:8000/api/auth/login \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "username=smilebigsun@yahoo.com&password=sebo123" \
  | python -c "import sys,json; print(json.load(sys.stdin)['access_token'])"
)
```

View citizen reports:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:8000/api/reports/mine
```

View map data:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:8000/api/reports/map
```

Ask the chatbot:

```bash
curl -s -X POST http://127.0.0.1:8000/api/chat/ \
  -H "Content-Type: application/json" \
  -d '{"message":"What are the upcoming events?"}'
```

Interactive chatbot test:

```bash
while true; do
  read -p "Ask AlalAI: " q
  [ -z "$q" ] && break
  curl -s -X POST http://127.0.0.1:8000/api/chat/ \
    -H "Content-Type: application/json" \
    -d "{\"message\":\"$q\"}" \
    | python -c "import sys,json; print(json.load(sys.stdin)['reply'])"
  echo
done
```

## Frontend Setup

From the repository root:

```bash
cd frontend
npm install
```

Create a local env file if needed:

```bash
cp .env.example .env.local
```

Common frontend variables:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_MAPTILER_KEY=your-maptiler-key
```

Run the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Deployment Notes

The backend includes `backend/vercel.json` for Vercel Python deployment. For deployment, configure environment variables in the hosting provider:

```env
DATABASE_URL=postgresql://...
SECRET_KEY=...
JWT_SECRET_KEY=...
JWT_ALGORITHM=HS256
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
FRONTEND_URL=https://your-frontend-domain.com
```

If using Supabase/PostgreSQL, `psycopg2-binary` must be installed from `backend/requirements.txt`.

For Gmail email notifications, use a Google App Password rather than your regular Gmail password. Gmail SMTP settings are:

```text
Server: smtp.gmail.com
Port: 587 with STARTTLS, or 465 with SSL/TLS
Username: your Gmail address
Password: your 16-character Google App Password
```

## Useful Commands

Backend:

```bash
cd backend
.venv/Scripts/python.exe -m uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm run dev
```

Check git changes:

```bash
git status
```

## Current POC Limitations

- Built for one barangay only
- Mock barangay knowledge base
- No SMS or email notifications
- No offline mode
- AI behavior depends on prompt quality and OpenAI availability
- Production hardening is still needed for auth, permissions, storage, logging, and migrations
