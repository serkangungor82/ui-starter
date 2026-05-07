"""Tenant kullanıcı yönetimi (CRUD).

Yetki:
- Liste/detay: users.read
- Oluşturma: users.create
- Güncelleme: users.update
- Silme: users.delete (soft delete — is_active=False)

Korumalar:
- Sistem rolü Owner'ı son kullanıcısı olarak silmek/pasifleştirmek/rol
  değiştirmek yasak (tenant kilitlenir).
- Kullanıcı kendi hesabını silemez.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from database import get_db
from models.role import Role
from models.tenant import Tenant
from models.user import User
from routers.auth import get_current_tenant, get_current_user
from services.rbac import require_permission
from services.security import hash_password


router = APIRouter(prefix="/tenant/users", tags=["tenant-users"])


# ── Schemas ─────────────────────────────────────────────────────

class UserCreateIn(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    role_id: int


class UserUpdateIn(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    role_id: Optional[int] = None
    is_active: Optional[bool] = None


# ── Helpers ─────────────────────────────────────────────────────

def _serialize(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": (
            {"id": user.role.id, "name": user.role.name, "is_system": user.role.is_system}
            if user.role
            else None
        ),
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


def _get_user_in_tenant(db: Session, tenant: Tenant, user_id: int) -> User:
    user = (
        db.query(User)
        .filter(User.id == user_id, User.tenant_id == tenant.id)
        .first()
    )
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    return user


def _require_role_in_tenant(db: Session, tenant: Tenant, role_id: int) -> Role:
    role = (
        db.query(Role)
        .filter(Role.id == role_id, Role.tenant_id == tenant.id)
        .first()
    )
    if not role:
        raise HTTPException(status_code=400, detail="Rol bu tenant'a ait değil")
    return role


def _is_owner_role(role: Optional[Role]) -> bool:
    return bool(role and role.is_system and role.name == "Owner")


def _count_active_owners(db: Session, tenant_id: int, exclude_user_id: Optional[int] = None) -> int:
    """Tenant'taki aktif Owner sayısı (soft delete ve rol değişimi koruması için)."""
    q = (
        db.query(User)
        .join(Role, User.role_id == Role.id)
        .filter(
            User.tenant_id == tenant_id,
            User.is_active.is_(True),
            Role.is_system.is_(True),
            Role.name == "Owner",
        )
    )
    if exclude_user_id is not None:
        q = q.filter(User.id != exclude_user_id)
    return q.count()


# ── Endpoints ───────────────────────────────────────────────────

@router.get("/", dependencies=[Depends(require_permission("users.read"))])
def list_users(
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    users = (
        db.query(User)
        .filter(User.tenant_id == tenant.id)
        .order_by(User.created_at.asc())
        .all()
    )
    return [_serialize(u) for u in users]


@router.get("/{user_id}", dependencies=[Depends(require_permission("users.read"))])
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    return _serialize(_get_user_in_tenant(db, tenant, user_id))


@router.post("/", status_code=201, dependencies=[Depends(require_permission("users.create"))])
def create_user(
    body: UserCreateIn,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    # Email çakışması (tenant içi)
    if db.query(User).filter(User.tenant_id == tenant.id, User.email == body.email).first():
        raise HTTPException(status_code=409, detail="Bu e-posta zaten bu tenant'ta kayıtlı")

    role = _require_role_in_tenant(db, tenant, body.role_id)
    user = User(
        tenant_id=tenant.id,
        email=body.email,
        first_name=body.first_name,
        last_name=body.last_name,
        password_hash=hash_password(body.password),
        role_id=role.id,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _serialize(user)


@router.patch("/{user_id}", dependencies=[Depends(require_permission("users.update"))])
def update_user(
    user_id: int,
    body: UserUpdateIn,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    user = _get_user_in_tenant(db, tenant, user_id)

    # Owner koruması: bu kullanıcı son aktif Owner ise rolünü değiştirmek
    # veya pasifleştirmek yasak.
    is_currently_owner = _is_owner_role(user.role)
    will_lose_owner = is_currently_owner and (
        (body.role_id is not None and body.role_id != user.role_id)
        or (body.is_active is False and user.is_active is True)
    )
    if will_lose_owner and _count_active_owners(db, tenant.id, exclude_user_id=user.id) == 0:
        raise HTTPException(
            status_code=400,
            detail="Tenant'taki son Owner — rol değiştirilemez veya pasifleştirilemez",
        )

    if body.first_name is not None:
        user.first_name = body.first_name
    if body.last_name is not None:
        user.last_name = body.last_name
    if body.role_id is not None and body.role_id != user.role_id:
        new_role = _require_role_in_tenant(db, tenant, body.role_id)
        user.role_id = new_role.id
    if body.is_active is not None:
        user.is_active = body.is_active

    db.commit()
    db.refresh(user)
    return _serialize(user)


@router.delete("/{user_id}", status_code=204, dependencies=[Depends(require_permission("users.delete"))])
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
):
    user = _get_user_in_tenant(db, tenant, user_id)

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Kendi hesabını silemezsin")

    if _is_owner_role(user.role) and _count_active_owners(db, tenant.id, exclude_user_id=user.id) == 0:
        raise HTTPException(
            status_code=400,
            detail="Tenant'taki son Owner — silinemez",
        )

    user.is_active = False
    db.commit()
    return None
