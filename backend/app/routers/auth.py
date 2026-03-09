from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from ..database import SessionLocal
from ..models import User
from ..auth_utils import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.username == form_data.username
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Wrong password")

    token = create_access_token({"sub": user.username})

    return {
        "access_token": token,
        "token_type": "bearer"
    }