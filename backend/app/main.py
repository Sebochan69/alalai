from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.db import Base, engine
from app.api.routes import auth, reports, admin, chatbot, notifications
from app.db.base import Base
# from app.db.session import engine
from app.api.routes import auth, reports, admin, chatbot, notifications, users
from app.db.base import Base
from app.db.session import engine
import app.db.db as legacy_db
from app.api.routes import auth, reports, admin, chatbot, notifications, complaint

Base.metadata.create_all(bind=engine)

# also create tables for legacy DB models defined in app.db.db
try:
    legacy_db.Base.metadata.create_all(bind=legacy_db.engine)
except Exception:
    # keep startup resilient if legacy DB engine is unavailable
    pass

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
# app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
# app.include_router(chatbot.router, prefix="/api/chat", tags=["Chatbot"])
app.include_router(notifications.router,
                   prefix="/api/notifications", tags=["Notifications"])
app.include_router(
    complaint.router, prefix="/api/complaints", tags=["Complaints"])


@app.get("/")
def root():
    return {"app": settings.APP_NAME, "status": "running"}
