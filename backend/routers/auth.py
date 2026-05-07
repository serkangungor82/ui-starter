import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from database import get_db
from models.tenant import Tenant, TenantStatus
from models.user import User
from models.verification import VerificationCode
from services.security import (
    hash_password,
    verify_password,
    create_tenant_token,
    decode_tenant_token,
)


router = APIRouter(prefix="/auth", tags=["auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


# ── Schemas ─────────────────────────────────────────────────────

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
    phone: str = Field(..., pattern=r"^\+[1-9]\d{6,14}$")


class ResetIn(BaseModel):
    phone: str = Field(..., pattern=r"^\+[1-9]\d{6,14}$")
    code: str
    password: str = Field(..., min_length=8)


# ── Dependencies ────────────────────────────────────────────────

def get_current_tenant(request: Request, db: Session = Depends(get_db)) -> Tenant:
    """Subdomain'den tenant'ı zorunlu olarak çözer.

    `app.localhost` (root) veya tenant olmayan host → 400. Suspended tenant → 403.
    """
    tenant_id = getattr(request.state, "tenant_id", None)
    if not tenant_id:
        raise HTTPException(
            status_code=400,
            detail="Bu istek bir tenant subdomain'inden gelmiyor",
        )
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant bulunamadı")
    if tenant.status == TenantStatus.suspended:
        raise HTTPException(status_code=403, detail="Tenant askıya alınmış")
    return tenant


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
) -> User:
    if not token:
        raise HTTPException(status_code=401, detail="Yetkisiz")
    payload = decode_tenant_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Geçersiz token")
    if payload["tenant_id"] != tenant.id:
        raise HTTPException(status_code=403, detail="Token bu tenant'a ait değil")

    user = (
        db.query(User)
        .filter(User.id == payload["user_id"], User.tenant_id == tenant.id)
        .first()
    )
    if not user or not user.is_active:
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

    print(f"[verification] user={user.email} channel={channel} code={code}", flush=True)
    return code


def _serialize_user(user: User) -> dict:
    role = user.role
    return {
        "id": user.id,
        "tenant_id": user.tenant_id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
        "role": (
            {"id": role.id, "name": role.name, "is_system": role.is_system}
            if role
            else None
        ),
        "permissions": sorted(p.key for p in role.permissions) if role else [],
        "email_verified": user.email_verified,
        "phone_verified": user.phone_verified,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


# ── Endpoints ───────────────────────────────────────────────────
# NOT: Public signup (`/signup`, yeni tenant + owner) PR 3'te eklenecek.
# Tenant admin'in çalışan eklemesi (`/users` POST) PR 2/3'te eklenecek.
# Bu yüzden bu PR'da public `/auth/register` yok.


@router.post("/login", response_model=TokenOut)
def login(
    body: LoginIn,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    user = (
        db.query(User)
        .filter(User.email == body.email, User.tenant_id == tenant.id)
        .first()
    )
    if not user or not user.password_hash or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="E-posta veya şifre hatalı")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Hesabınız pasif")

    return TokenOut(access_token=create_tenant_token(user.id, tenant.id))


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return _serialize_user(current_user)


@router.get("/me/logins")
def login_history(current_user: User = Depends(get_current_user)):
    # Stub: gerçek bir LoginLog tablosu eklendiğinde buradan döndür
    return []


@router.post("/verify")
def verify(
    body: VerifyIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rec = (
        db.query(VerificationCode)
        .filter(
            VerificationCode.user_id == current_user.id,
            VerificationCode.channel == body.channel,
            VerificationCode.consumed_at.is_(None),
        )
        .order_by(VerificationCode.created_at.desc())
        .first()
    )

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
def resend(
    body: ResendIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.channel not in ("email", "sms"):
        raise HTTPException(status_code=400, detail="Geçersiz kanal")
    _create_verification(current_user, body.channel, db)
    return {"ok": True}


@router.post("/forgot-password")
def forgot(
    body: ForgotIn,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    """SMS ile şifre sıfırlama kodu gönderir. Phone tenant içinde unique."""
    user = (
        db.query(User)
        .filter(User.phone == body.phone, User.tenant_id == tenant.id)
        .first()
    )
    # Kullanıcı yoksa bile başarı dön — enumeration saldırısı engelle
    if user:
        # Kanal "password_reset" olarak kalıyor (geriye uyumlu); SMS gönderim
        # stub'u _create_verification içinde [verification] log satırı yazar.
        _create_verification(user, "password_reset", db, ttl_minutes=15)
    return {"ok": True}


@router.post("/reset-password")
def reset(
    body: ResetIn,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    user = (
        db.query(User)
        .filter(User.phone == body.phone, User.tenant_id == tenant.id)
        .first()
    )
    if not user:
        raise HTTPException(status_code=400, detail="Geçersiz istek")

    rec = (
        db.query(VerificationCode)
        .filter(
            VerificationCode.user_id == user.id,
            VerificationCode.channel == "password_reset",
            VerificationCode.consumed_at.is_(None),
        )
        .order_by(VerificationCode.created_at.desc())
        .first()
    )

    if not rec or rec.code != body.code:
        raise HTTPException(status_code=400, detail="Kod hatalı")
    if rec.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Kodun süresi dolmuş")

    rec.consumed_at = datetime.now(timezone.utc)
    user.password_hash = hash_password(body.password)
    db.commit()
    return {"ok": True}
