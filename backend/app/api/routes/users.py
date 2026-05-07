from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.routes.auth import get_db, pwd_content
from app.db.db import User
from app.schemas.schemas import UserResponse, AdminCreate, UserUpdate
from app.api.routes.auth import get_current_user

UserUpdate.model_rebuild()
UserResponse.model_rebuild()

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = db.query(User).all()

    return users

@router.get("/admins", response_model=List[UserResponse])
def get_all_admins(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admins only."
        )

    admins = db.query(User).filter(User.role == "admin").all()
    return admins

@router.get("/{user_id}", response_model=UserResponse)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User not found."
        )
    
    return user


@router.get("/admins/{admin_id}", response_model=UserResponse)
def get_admin_by_id(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only admins can view admin profiles."
        )

    admin = db.query(User).filter(
        User.id == admin_id, 
        User.role == "admin"
    ).first()

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin user not found or the ID does not belong to an admin."
        )

    return admin

@router.post("/admins", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_admin_user(
    admin_in: AdminCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access denied. Only existing admins can create new admin accounts."
        )

    existing_user = db.query(User).filter(User.email_address == admin_in.email_address).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Email address is already registered."
        )

    new_admin = User(
        username=admin_in.username,
        email_address=admin_in.email_address,
        hashed_password=pwd_content.hash(admin_in.password),
        role="admin",
        location_assigned=admin_in.location_assigned
    )

    try:
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        return new_admin
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the admin account."
        )

@router.patch("/admins/{user_id}", response_model=UserResponse)
def update_admin_info(
    user_id: int,
    user_updates: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admins only.")

    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user_updates.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/admins/{admin_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_account(
    admin_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only admins can manage admin accounts."
        )

    admin_to_delete = db.query(User).filter(
        User.id == admin_id, 
        User.role == "admin"
    ).first()
    
    if not admin_to_delete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin account not found."
        )

    if admin_to_delete.id == current_user.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Safety rule: You cannot delete your own admin account."
        )

    try:
        db.delete(admin_to_delete)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete admin. Check if they have assigned tasks/complaints."
        )

    return None