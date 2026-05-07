"""Tenant rol oluşturma formu için tüm permission listesi."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.permission import Permission
from services.rbac import require_permission


router = APIRouter(prefix="/tenant/permissions", tags=["tenant-permissions"])


@router.get("/", dependencies=[Depends(require_permission("roles.read"))])
def list_permissions(db: Session = Depends(get_db)):
    perms = db.query(Permission).order_by(Permission.key.asc()).all()
    return [
        {"id": p.id, "key": p.key, "name": p.name, "description": p.description}
        for p in perms
    ]
