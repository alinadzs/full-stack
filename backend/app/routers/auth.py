from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
import logging

from ..database import get_db
from ..models import User
from ..auth_utils import verify_password, create_access_token, hash_password
from ..schemas.user import UserCreate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Регистрация нового пользователя"""
    
    # Проверяем, не существует ли уже пользователь
    existing_user = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()
    
    if existing_user:
        logger.warning(f"Registration attempt with existing username/email: {user_data.username}")
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    # Создаём нового пользователя
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        is_admin=False,
        is_active=True
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    logger.info(f"New user registered: {user_data.username}")
    
    return {
        "id": db_user.id,
        "username": db_user.username,
        "email": db_user.email,
        "message": "User registered successfully"
    }


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Вход пользователя"""
    
    user = db.query(User).filter(User.username == form_data.username).first()
    
    if not user:
        logger.warning(f"Login attempt with non-existent user: {form_data.username}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user.is_active:
        logger.warning(f"Login attempt by inactive user: {form_data.username}")
        raise HTTPException(status_code=403, detail="User account is inactive")
    
    if not verify_password(form_data.password, user.password_hash):
        logger.warning(f"Failed login attempt for user: {form_data.username}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user.username})
    
    logger.info(f"User logged in: {form_data.username}")
    
    return {"access_token": token, "token_type": "bearer"}