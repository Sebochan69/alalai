from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.db import SessionLocal, User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    secrets = []
    for secret in (settings.JWT_SECRET_KEY, settings.SECRET_KEY):
        if secret and secret not in secrets:
            secrets.append(secret)

    try:
        payload = None
        for secret in secrets:
            try:
                payload = jwt.decode(
                    token,
                    secret,
                    algorithms=[settings.JWT_ALGORITHM],
                )
                break
            except JWTError:
                continue

        if payload is None:
            raise JWTError()

        user_id = payload.get("id") or payload.get("user_id")
        if user_id is None:
            user_id = payload.get("sub")
        user_id = int(user_id)
    except (JWTError, TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if (current_user.role or "").lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return current_user
