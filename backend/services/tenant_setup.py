"""Bir tenant'ın ilk kurulumu için yardımcılar.

Bu PR'da: default sistem rollerini (Owner/Admin/Member) ve permission
atamalarını kurar. PR 3'te self-service signup endpoint'i bu fonksiyonu
çağıracak.
"""
from sqlalchemy.orm import Session

from models.permission import Permission
from models.role import Role
from models.role_permission import RolePermission
from services.permissions import DEFAULT_ROLE_PERMISSIONS


def ensure_permissions(db: Session) -> dict[str, Permission]:
    """Code-tanımlı PERMISSIONS listesini DB'ye senkronlar.

    Idempotent: eksikleri ekler, var olanların adı/description'ı güncel listeye
    göre yenilenir. Listede artık olmayanlar **silinmez** (FK güvenliği için
    manuel temizlik gerekirse ayrıca yapılır).
    """
    from services.permissions import PERMISSIONS

    existing = {p.key: p for p in db.query(Permission).all()}
    for pdef in PERMISSIONS:
        rec = existing.get(pdef.key)
        if rec is None:
            rec = Permission(key=pdef.key, name=pdef.name, description=pdef.description)
            db.add(rec)
            existing[pdef.key] = rec
        else:
            # Adı/açıklamayı kod ile senkron tut
            rec.name = pdef.name
            rec.description = pdef.description
    db.commit()

    # Refresh map
    return {p.key: p for p in db.query(Permission).all()}


def initialize_tenant_roles(db: Session, tenant_id: int) -> dict[str, Role]:
    """Verilen tenant için Owner/Admin/Member sistem rollerini kurar.

    Var olanları atlar (idempotent). Permission atamaları her çağrıda kod
    tanımına göre güncellenir.
    """
    perms_by_key = ensure_permissions(db)

    existing_roles = {
        r.name: r
        for r in db.query(Role)
        .filter(Role.tenant_id == tenant_id, Role.is_system.is_(True))
        .all()
    }

    result: dict[str, Role] = {}
    for role_name, perm_keys in DEFAULT_ROLE_PERMISSIONS.items():
        role = existing_roles.get(role_name)
        if role is None:
            role = Role(
                tenant_id=tenant_id,
                name=role_name,
                description=f"Sistem rolü — {role_name}",
                is_system=True,
            )
            db.add(role)
            db.flush()  # role.id gerekli

        # Permission atamalarını yenile (sistem rolü kod ile senkron)
        db.query(RolePermission).filter(RolePermission.role_id == role.id).delete()
        for key in perm_keys:
            perm = perms_by_key.get(key)
            if perm is None:
                continue
            db.add(RolePermission(role_id=role.id, permission_id=perm.id))
        result[role_name] = role

    db.commit()
    return result
