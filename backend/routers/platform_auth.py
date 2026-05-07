from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import get_db
from models.platform_user import PlatformUser
from services.security import (
    verify_password,
    create_platform_token,
    decode_platform_token,
)


router = APIRouter(prefix="/platform/auth", tags=["platform-auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/platform/auth/login", auto_error=False)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


def get_current_platform_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> PlatformUser:
    if not token:
        raise HTTPException(status_code=401, detail="Yetkisiz")
    payload = decode_platform_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Geçersiz token")
    user = (
        db.query(PlatformUser)
        .filter(PlatformUser.id == payload["platform_user_id"])
        .first()
    )
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Geçersiz platform kullanıcısı")
    return user


def _serialize(user: PlatformUser) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


@router.post("/login", response_model=TokenOut)
def login(body: LoginIn, db: Session = Depends(get_db)):
    user = db.query(PlatformUser).filter(PlatformUser.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Hesap pasif")

    return TokenOut(access_token=create_platform_token(user.id))


@router.get("/me")
def me(current_user: PlatformUser = Depends(get_current_platform_user)):
    return _serialize(current_user)
