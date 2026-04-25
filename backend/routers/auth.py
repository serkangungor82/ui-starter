import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.verification import VerificationCode
from services.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_token,
)


router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


# ── Schemas ─────────────────────────────────────────────────────

class RegisterIn(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    password: str = Field(..., min_length=8)


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class VerifyIn(BaseModel):
    channel: str  # "email" | "sms"
    code: str


class ResendIn(BaseModel):
    channel: str


class ForgotIn(BaseModel):
    email: EmailStr


class ResetIn(BaseModel):
    email: EmailStr
    code: str
    password: str = Field(..., min_length=8)


# ── Dependencies ────────────────────────────────────────────────

def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    if not token:
        raise HTTPException(status_code=401, detail="Yetkisiz")
    user_id = decode_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Geçersiz token")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or user.is_suspended:
        raise HTTPException(status_code=401, detail="Geçersiz kullanıcı")
    return user


# ── Helpers ─────────────────────────────────────────────────────

def _create_verification(user: User, channel: str, db: Session, ttl_minutes: int = 10) -> str:
    """Yeni 6-haneli kod üretir, eskileri tüketilmiş işaretler."""
    db.query(VerificationCode).filter(
        VerificationCode.user_id == user.id,
        VerificationCode.channel == channel,
        VerificationCode.consumed_at.is_(None),
    ).update({"consumed_at": datetime.now(timezone.utc)})

    code = "".join(str(secrets.randbelow(10)) for _ in range(6))
    rec = VerificationCode(
        user_id=user.id,
        channel=channel,
        code=code,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=ttl_minutes),
    )
    db.add(rec)
    db.commit()

    # NOTE: Production'da burası SMS/e-mail provider'a (Resend, MobilDev vs.)
    # gönderim yapmalı. Şimdilik konsola yazdırıyoruz.
    print(f"[verification] user={user.email} channel={channel} code={code}", flush=True)
    return code


def _serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
        "email_verified": user.email_verified,
        "phone_verified": user.phone_verified,
        "is_admin": user.is_admin,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


# ── Endpoints ───────────────────────────────────────────────────

@router.post("/register", status_code=201)
def register(body: RegisterIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Bu e-posta zaten kayıtlı")
    if body.phone and db.query(User).filter(User.phone == body.phone).first():
        raise HTTPException(status_code=400, detail="Bu telefon zaten kayıtlı")

    user = User(
        email=body.email,
        first_name=body.first_name,
        last_name=body.last_name,
        phone=body.phone,
        password_hash=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    _create_verification(user, "email", db)
    return _serialize_user(user)


@router.post("/login", response_model=TokenOut)
def login(body: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not user.password_hash or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")
    if user.is_suspended:
        raise HTTPException(status_code=403, detail="Hesabınız askıya alınmış")

    return TokenOut(access_token=create_access_token(user.id))


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return _serialize_user(current_user)


@router.get("/me/logins")
def login_history(current_user: User = Depends(get_current_user)):
    # Stub: gerçek bir LoginLog tablosu eklendiğinde buradan döndür
    return []


@router.post("/verify")
def verify(body: VerifyIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rec = db.query(VerificationCode).filter(
        VerificationCode.user_id == current_user.id,
        VerificationCode.channel == body.channel,
        VerificationCode.consumed_at.is_(None),
    ).order_by(VerificationCode.created_at.desc()).first()

    if not rec or rec.code != body.code:
        raise HTTPException(status_code=400, detail="Kod hatalı")
    if rec.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Kodun süresi dolmuş")

    rec.consumed_at = datetime.now(timezone.utc)
    if body.channel == "email":
        current_user.email_verified = True
    elif body.channel == "sms":
        current_user.phone_verified = True
    db.commit()
    return {"ok": True}


@router.post("/me/resend-verification")
def resend(body: ResendIn, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if body.channel not in ("email", "sms"):
        raise HTTPException(status_code=400, detail="Geçersiz kanal")
    _create_verification(current_user, body.channel, db)
    return {"ok": True}


@router.post("/forgot-password")
def forgot(body: ForgotIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    # Kullanıcı yoksa bile başarı dön — enumeration saldırısı engelle
    if user:
        _create_verification(user, "password_reset", db, ttl_minutes=15)
    return {"ok": True}


@router.post("/reset-password")
def reset(body: ResetIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Geçersiz istek")

    rec = db.query(VerificationCode).filter(
        VerificationCode.user_id == user.id,
        VerificationCode.channel == "password_reset",
        VerificationCode.consumed_at.is_(None),
    ).order_by(VerificationCode.created_at.desc()).first()

    if not rec or rec.code != body.code:
        raise HTTPException(status_code=400, detail="Kod hatalı")
    if rec.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Kodun süresi dolmuş")

    rec.consumed_at = datetime.now(timezone.utc)
    user.password_hash = hash_password(body.password)
    db.commit()
    return {"ok": True}
