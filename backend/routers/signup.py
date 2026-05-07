"""Public self-service signup.

Subdomain context'i YOKTUR — bu endpoint kök host'tan veya `signup.localhost`
gibi public bir adresten çağrılır. Yeni bir tenant + sistem rolleri + ilk
Owner kullanıcı kurar.
"""
import re

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from database import get_db
from middleware.tenant import RESERVED_SLUGS
from models.tenant import Tenant, TenantStatus
from models.user import User
from services.security import hash_password, create_tenant_token
from services.tenant_setup import initialize_tenant_roles


router = APIRouter(tags=["signup"])


SLUG_PATTERN = re.compile(r"^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$")


class SignupIn(BaseModel):
    tenant_name: str = Field(..., min_length=2, max_length=255)
    slug: str = Field(..., min_length=3, max_length=63)
    owner_email: EmailStr
    owner_password: str = Field(..., min_length=8)
    owner_first_name: str = Field(..., min_length=1, max_length=100)
    owner_last_name: str = Field(..., min_length=1, max_length=100)
    owner_phone: str = Field(..., pattern=r"^\+[1-9]\d{6,14}$")


class SignupOut(BaseModel):
    tenant: dict
    user: dict
    access_token: str
    token_type: str = "bearer"


@router.post("/signup", response_model=SignupOut, status_code=201)
def signup(body: SignupIn, db: Session = Depends(get_db)):
    slug = body.slug.strip().lower()

    # Format kontrolü — DNS-safe alt seviyeli ad
    if not SLUG_PATTERN.match(slug):
        raise HTTPException(
            status_code=400,
            detail="Slug yalnızca küçük harf, rakam ve tire içerebilir; başında/sonunda tire olamaz",
        )
    if slug in RESERVED_SLUGS:
        raise HTTPException(status_code=400, detail=f"'{slug}' rezerve bir slug, başka bir tane seç")

    # Çakışma
    if db.query(Tenant).filter(Tenant.slug == slug).first():
        raise HTTPException(status_code=409, detail=f"'{slug}' slug'ı zaten kullanılıyor")

    # Tenant + sistem rolleri + ilk Owner — bütünüyle bir transaction
    try:
        tenant = Tenant(
            name=body.tenant_name.strip(),
            slug=slug,
            status=TenantStatus.trial,
        )
        db.add(tenant)
        db.flush()  # tenant.id

        roles = initialize_tenant_roles(db, tenant.id)

        owner = User(
            tenant_id=tenant.id,
            email=body.owner_email,
            first_name=body.owner_first_name,
            last_name=body.owner_last_name,
            phone=body.owner_phone,
            password_hash=hash_password(body.owner_password),
            role_id=roles["Owner"].id,
            is_active=True,
        )
        db.add(owner)
        db.commit()
        db.refresh(tenant)
        db.refresh(owner)
    except Exception:
        db.rollback()
        raise

    return {
        "tenant": {
            "id": tenant.id,
            "name": tenant.name,
            "slug": tenant.slug,
            "status": tenant.status.value,
        },
        "user": {
            "id": owner.id,
            "email": owner.email,
            "first_name": owner.first_name,
            "last_name": owner.last_name,
            "role": "Owner",
        },
        "access_token": create_tenant_token(owner.id, tenant.id),
        "token_type": "bearer",
    }
