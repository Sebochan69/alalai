from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.models import ChatMessage, User
from app.schemas.schemas import ChatRequest, ChatResponse
from app.services.ai.ai_service import AIService

router = APIRouter()


@router.post("/", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ai = AIService()
    reply = ai.answer_question(payload.message)

    db.add(ChatMessage(user_id=current_user.id, role="user", content=payload.message))
    db.add(ChatMessage(user_id=current_user.id, role="assistant", content=reply))
    db.commit()

    return ChatResponse(reply=reply)
