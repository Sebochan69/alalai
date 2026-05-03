# Project Structure

```text
alalai/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py
│   │   │   └── routes/
│   │   │       ├── admin.py
│   │   │       ├── auth.py
│   │   │       ├── chatbot.py
│   │   │       ├── notifications.py
│   │   │       └── reports.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── constants.py
│   │   │   └── security.py
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   └── session.py
│   │   ├── models/
│   │   │   └── models.py
│   │   ├── prompts/
│   │   │   ├── analytics.md
│   │   │   ├── assignment.md
│   │   │   ├── chatbot.md
│   │   │   ├── duplicate_detection.md
│   │   │   └── tagging.md
│   │   ├── schemas/
│   │   │   └── schemas.py
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   ├── ai_service.py
│   │   │   │   └── prompt_loader.py
│   │   │   ├── analytics_service.py
│   │   │   ├── notification_service.py
│   │   │   └── report_service.py
│   │   ├── seed/
│   │   │   ├── barangay_info_mock.md
│   │   │   └── seed_data.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── config/
│   │   │   └── appConfig.js
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── StatusBadge.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   └── citizen/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── store/
│   │   │   └── authStore.js
│   │   └── main.jsx
│   ├── package.json
│   └── .env.example
└── docs/
```
