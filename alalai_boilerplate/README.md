# AlalAI (Alalay)

AI-assisted barangay complaint and analytics system for a 5-day hackathon POC.

## Scope

One barangay only. Online-only. Expected demo volume: around 10 reports/day.

### Core Features

- Citizen registration/login
- Citizen complaint filing
- 3 reports per citizen limit
- AI auto-tagging, priority, summary, and location area extraction
- AI-assisted admin assignment
- Admin report management
- In-app notifications
- Analytics dashboard
- Complaint map
- Chatbot using mock barangay knowledge base
- Duplicate complaint detection

### Skipped for POC

- Image AI
- Multi-barangay support
- Offline mode
- SMS/email notifications
- Production-level hardening

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy
- SQLite
- LangChain + OpenAI
- JWT auth

### Frontend
- React + Vite
- React Router
- Zustand
- Axios
- TailwindCSS
- React Leaflet

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux

uvicorn app.main:app --reload
```

API docs:

```text
http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux

npm run dev
```

App:

```text
http://localhost:5173
```

## Team Workflow

Recommended branch names:

```text
feature/backend-auth
feature/backend-reports
feature/backend-ai
feature/frontend-auth
feature/frontend-citizen
feature/frontend-admin
feature/frontend-map-chatbot
```

## Project Layout

See `docs/PROJECT_STRUCTURE.md`.
