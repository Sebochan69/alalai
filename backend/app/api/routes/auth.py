from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.exc import UnknownHashError
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from typing import Optional
from dotenv import load_dotenv
import os

from sqlalchemy.orm import Session 
from app.schemas.schemas import (
    LoginRequest, Token, TokenData, UserResponse, 
    UserCreate, ChangePasswordRequest
)

from app.db.db import SessionLocal, User

load_dotenv()

# --- Configuration (Move to .env later) ---
SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('JWT_ALGORITHM')
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', 15))

router = APIRouter()

pwd_content = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def verify_password(plain_password, hashed_password):
    try:
        return pwd_content.verify(plain_password, hashed_password)
    except UnknownHashError:
        return False


async def get_current_user(token: str = Depends(oauth2_scheme)) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: int = payload.get("id")
        role: str = payload.get("role")

        if email is None or user_id is None:
            raise credentials_exception

        return TokenData(email=email, user_id=user_id, role=role)
    except JWTError:
        raise credentials_exception


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/login", response_model=Token)
async def login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email_address == username).first()

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    access_token = create_access_token(
        data={"sub": user.email_address, "id": user.id, "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == current_user.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/logout")
async def logout(current_user: TokenData = Depends(get_current_user)):
    return {"message": "Successfully logged out"}


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_citizen(user_in: UserCreate, db: SessionLocal = Depends(get_db)):
    user_exists = db.query(User).filter(User.email_address == user_in.email_address).first()
    if user_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    username_exists = db.query(User).filter(User.username == user_in.username).first()
    if username_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    hashed_pass = pwd_content.hash(user_in.password)

    new_user = User(
        username=user_in.username,
        email_address=user_in.email_address,
        hashed_password=hashed_pass,
        location_assigned=user_in.location_assigned,
        role="citizen"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/change-password")
async def change_password(
    password_data: ChangePasswordRequest, 
    db: Session = Depends(get_db), 
    current_user: TokenData = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == current_user.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(password_data.old_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect old password"
        )
    
    if verify_password(password_data.new_password, user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="New password cannot be the same as the old password"
        )

    user.hashed_password = pwd_content.hash(password_data.new_password)
    db.commit()

    return {"message": "Password updated successfully"}