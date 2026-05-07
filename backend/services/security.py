from datetime import datetime, timedelta, timezone
from typing import Optional, TypedDict

from jose import JWTError, jwt
from passlib.context import CryptContext

from config import settings


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def _expiry(expires_delta: Optional[timedelta] = None) -> datetime:
    return datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )


def _encode(payload: dict) -> str:
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def _decode(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None


# ── Tenant tokens ───────────────────────────────────────────────

class TenantTokenPayload(TypedDict):
    user_id: int
    tenant_id: int


def create_tenant_token(user_id: int, tenant_id: int, expires_delta: Optional[timedelta] = None) -> str:
    payload = {
        "sub": str(user_id),
        "tenant_id": tenant_id,
        "typ": "tenant",
        "exp": _expiry(expires_delta),
    }
    return _encode(payload)


def decode_tenant_token(token: str) -> Optional[TenantTokenPayload]:
    data = _decode(token)
    if not data or data.get("typ") != "tenant":
        return None
    try:
        return {"user_id": int(data["sub"]), "tenant_id": int(data["tenant_id"])}
    except (KeyError, TypeError, ValueError):
        return None


# ── Platform tokens ─────────────────────────────────────────────

class PlatformTokenPayload(TypedDict):
    platform_user_id: int


def create_platform_token(platform_user_id: int, expires_delta: Optional[timedelta] = None) -> str:
    payload = {
        "sub": str(platform_user_id),
        "typ": "platform",
        "exp": _expiry(expires_delta),
    }
    return _encode(payload)


def decode_platform_token(token: str) -> Optional[PlatformTokenPayload]:
    data = _decode(token)
    if not data or data.get("typ") != "platform":
        return None
    try:
        return {"platform_user_id": int(data["sub"])}
    except (KeyError, TypeError, ValueError):
        return None
