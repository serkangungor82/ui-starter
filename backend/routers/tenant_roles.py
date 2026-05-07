"""Tenant rol yönetimi (CRUD).

Sistem rolleri (Owner/Admin/Member, is_system=True) için kısıtlamalar:
- Adı değiştirilemez
- Silinemez
- Permission listesi kod tarafından kontrol edilir; UI'dan değiştirilebilir
  ama bir sonraki seed/initialize_tenant_roles çağrısı sıfırlar. Bu PR'da
  sistem rollerinde permission güncellemeyi de engelliyoruz; özelleştirme
  için custom rol oluştur.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from models.permission import Permission
from models.role import Role
from models.role_permission import RolePermission
from models.tenant import Tenant
from routers.auth import get_current_tenant
from services.rbac import require_permission


router = APIRouter(prefix="/tenant/roles", tags=["tenant-roles"])


# ── Schemas ─────────────────────────────────────────────────────

class RoleCreateIn(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    permission_keys: list[str] = Field(default_factory=list)


class RoleUpdateIn(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    permission_keys: Optional[list[str]] = None


# ── Helpers ─────────────────────────────────────────────────────

def _serialize(role: Role) -> dict:
    return {
        "id": role.id,
        "name": role.name,
        "description": role.description,
        "is_system": role.is_system,
        "permissions": sorted(p.key for p in role.permissions),
        "created_at": role.created_at.isoformat() if role.created_at else None,
    }


def _get_role_in_tenant(db: Session, tenant: Tenant, role_id: int) -> Role:
    role = (
        db.query(Role)
        .filter(Role.id == role_id, Role.tenant_id == tenant.id)
        .first()
    )
    if not role:
        raise HTTPException(status_code=404, detail="Rol bulunamadı")
    return role


def _resolve_permissions(db: Session, keys: list[str]) -> list[Permission]:
    if not keys:
        return []
    perms = db.query(Permission).filter(Permission.key.in_(keys)).all()
    found = {p.key for p in perms}
    missing = [k for k in keys if k not in found]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Geçersiz permission key(ler): {', '.join(missing)}",
        )
    return perms


def _set_role_permissions(db: Session, role: Role, perms: list[Permission]) -> None:
    db.query(RolePermission).filter(RolePermission.role_id == role.id).delete()
    for p in perms:
        db.add(RolePermission(role_id=role.id, permission_id=p.id))


# ── Endpoints ───────────────────────────────────────────────────

@router.get("/", dependencies=[Depends(require_permission("roles.read"))])
def list_roles(
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    roles = (
        db.query(Role)
        .filter(Role.tenant_id == tenant.id)
        .order_by(Role.is_system.desc(), Role.name.asc())
        .all()
    )
    return [_serialize(r) for r in roles]


@router.get("/{role_id}", dependencies=[Depends(require_permission("roles.read"))])
def get_role(
    role_id: int,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    return _serialize(_get_role_in_tenant(db, tenant, role_id))


@router.post("/", status_code=201, dependencies=[Depends(require_permission("roles.create"))])
def create_role(
    body: RoleCreateIn,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    # Aynı isimle başka bir rol var mı?
    if db.query(Role).filter(Role.tenant_id == tenant.id, Role.name == body.name).first():
        raise HTTPException(status_code=409, detail="Bu isimde bir rol zaten var")

    perms = _resolve_permissions(db, body.permission_keys)
    role = Role(
        tenant_id=tenant.id,
        name=body.name,
        description=body.description,
        is_system=False,
    )
    db.add(role)
    db.flush()
    _set_role_permissions(db, role, perms)
    db.commit()
    db.refresh(role)
    return _serialize(role)


@router.patch("/{role_id}", dependencies=[Depends(require_permission("roles.update"))])
def update_role(
    role_id: int,
    body: RoleUpdateIn,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    role = _get_role_in_tenant(db, tenant, role_id)

    if role.is_system:
        # Sistem rollerinde sadece description güncellenebilir
        if body.name is not None and body.name != role.name:
            raise HTTPException(status_code=400, detail="Sistem rolünün adı değiştirilemez")
        if body.permission_keys is not None:
            raise HTTPException(
                status_code=400,
                detail="Sistem rolünün permission'ları değiştirilemez (özel rol oluştur)",
            )
        if body.description is not None:
            role.description = body.description
        db.commit()
        db.refresh(role)
        return _serialize(role)

    # Custom rol — tüm alanlar güncellenebilir
    if body.name is not None and body.name != role.name:
        if (
            db.query(Role)
            .filter(Role.tenant_id == tenant.id, Role.name == body.name, Role.id != role.id)
            .first()
        ):
            raise HTTPException(status_code=409, detail="Bu isimde bir rol zaten var")
        role.name = body.name
    if body.description is not None:
        role.description = body.description
    if body.permission_keys is not None:
        perms = _resolve_permissions(db, body.permission_keys)
        _set_role_permissions(db, role, perms)

    db.commit()
    db.refresh(role)
    return _serialize(role)


@router.delete("/{role_id}", status_code=204, dependencies=[Depends(require_permission("roles.delete"))])
def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    role = _get_role_in_tenant(db, tenant, role_id)
    if role.is_system:
        raise HTTPException(status_code=400, detail="Sistem rolü silinemez")

    # Bu rolü kullanan user'lar role_id=NULL'a düşer (FK ondelete=SET NULL).
    # Devre dışı kalmış kullanıcılar gibi davranırlar — yetkileri yoktur.
    db.delete(role)
    db.commit()
    return None
