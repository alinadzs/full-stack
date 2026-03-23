from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import logging
from ..database import get_db
from ..models.user import User
from ..schemas.user import UserCreate, UserUpdate, UserResponse
from ..auth_utils import hash_password
from ..dependencies import get_current_user, check_admin

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=dict)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Создание нового пользователя (доступно без аутентификации - регистрация)"""
    
    db_user = User(
        username=user.username,
        email=user.email,
        password_hash=hash_password(user.password),
        is_admin=False,
        is_active=True
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    logger.info(f"User created: {user.username}")

    return {"id": db_user.id, "username": db_user.username, "email": db_user.email}


@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin)
):
    """Получить всех пользователей (только для админов)"""
    logger.info(f"Admin {current_user.username} retrieved all users")
    return db.query(User).all()


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Получить информацию о текущем пользователе"""
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получить пользователя (свои данные или админ может любого)"""
    
    # Пользователь может видеть только свои данные, или админ может видеть любого
    if current_user.id != user_id and not current_user.is_admin:
        logger.warning(f"Unauthorized access attempt by user {current_user.username} to user {user_id}")
        raise HTTPException(status_code=403, detail="Access denied")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Обновить пользователя (только свои данные или админ)"""
    
    # Проверка доступа
    if current_user.id != user_id and not current_user.is_admin:
        logger.warning(f"Unauthorized update attempt by user {current_user.username} to user {user_id}")
        raise HTTPException(status_code=403, detail="Access denied")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    # Обновляем только разрешённые поля
    if user_data.email:
        user.email = user_data.email
    
    # Пароль меняется отдельно через специальный эндпоинт
    
    db.commit()
    db.refresh(user)
    
    logger.info(f"User {user_id} updated by {current_user.username}")
    return user


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(check_admin)
):
    """Удалить пользователя (только админ)"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    logger.warning(f"User {user_id} deleted by admin {current_user.username}")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}