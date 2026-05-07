"""Ürün ve Hizmet kataloğu CRUD endpoint'leri (tenant-scope).

Permission'lar:
- GET /tenant/products (liste, detay) — products.read
- POST /tenant/products — products.create
- PATCH /tenant/products/{id} — products.update
- DELETE /tenant/products/{id} — products.delete (soft delete: is_active=False)
"""
import re
from decimal import Decimal
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from models.product import Product, ProductType
from models.tenant import Tenant
from routers.auth import get_current_tenant
from services.rbac import require_permission


router = APIRouter(prefix="/tenant/products", tags=["tenant-products"])

SLUG_PATTERN = re.compile(r"^[a-z0-9](?:[a-z0-9-]{0,253}[a-z0-9])?$")


# ── Schemas ─────────────────────────────────────────────────────

class FeatureItem(BaseModel):
    name: str
    value: str


class ProductBase(BaseModel):
    type: ProductType = ProductType.product
    name: str = Field(..., min_length=1, max_length=255)

    sku: Optional[str] = Field(None, max_length=64)
    barcode: Optional[str] = Field(None, max_length=64)
    qr_code: Optional[str] = Field(None, max_length=255)

    short_description: Optional[str] = Field(None, max_length=500)
    long_description: Optional[str] = None
    features: Optional[list[FeatureItem]] = None

    price: Optional[Decimal] = Field(None, ge=0)
    currency: str = Field("TRY", min_length=3, max_length=3)
    vat_rate: Optional[Decimal] = Field(None, ge=0, le=100)
    unit: Optional[str] = Field(None, max_length=20)
    stock_quantity: Optional[Decimal] = Field(None, ge=0)
    min_stock: Optional[Decimal] = Field(None, ge=0)

    seo_title: Optional[str] = Field(None, max_length=255)
    seo_description: Optional[str] = Field(None, max_length=500)
    seo_slug: Optional[str] = Field(None, max_length=255)

    is_active: bool = True


class ProductCreateIn(ProductBase):
    pass


class ProductUpdateIn(BaseModel):
    type: Optional[ProductType] = None
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, max_length=64)
    barcode: Optional[str] = Field(None, max_length=64)
    qr_code: Optional[str] = Field(None, max_length=255)
    short_description: Optional[str] = Field(None, max_length=500)
    long_description: Optional[str] = None
    features: Optional[list[FeatureItem]] = None
    price: Optional[Decimal] = Field(None, ge=0)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    vat_rate: Optional[Decimal] = Field(None, ge=0, le=100)
    unit: Optional[str] = Field(None, max_length=20)
    stock_quantity: Optional[Decimal] = Field(None, ge=0)
    min_stock: Optional[Decimal] = Field(None, ge=0)
    seo_title: Optional[str] = Field(None, max_length=255)
    seo_description: Optional[str] = Field(None, max_length=500)
    seo_slug: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None


# ── Helpers ─────────────────────────────────────────────────────

def _serialize(p: Product) -> dict[str, Any]:
    return {
        "id": p.id,
        "type": p.type.value,
        "name": p.name,
        "sku": p.sku,
        "barcode": p.barcode,
        "qr_code": p.qr_code,
        "short_description": p.short_description,
        "long_description": p.long_description,
        "features": p.features,
        "price": str(p.price) if p.price is not None else None,
        "currency": p.currency,
        "vat_rate": str(p.vat_rate) if p.vat_rate is not None else None,
        "unit": p.unit,
        "stock_quantity": str(p.stock_quantity) if p.stock_quantity is not None else None,
        "min_stock": str(p.min_stock) if p.min_stock is not None else None,
        "seo_title": p.seo_title,
        "seo_description": p.seo_description,
        "seo_slug": p.seo_slug,
        "is_active": p.is_active,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    }


def _check_slug(slug: Optional[str]):
    if slug is not None and slug != "" and not SLUG_PATTERN.match(slug):
        raise HTTPException(
            status_code=400,
            detail="SEO slug yalnızca küçük harf/rakam/tire içerebilir; başında/sonunda tire olamaz",
        )


def _normalize_features(raw) -> Optional[list[dict]]:
    """Pydantic FeatureItem → JSON'a uygun dict listesi.
    Hizmet türü için boş liste de OK, None bırakırız.
    """
    if raw is None:
        return None
    return [{"name": f.name, "value": f.value} for f in raw]


# ── Endpoints ───────────────────────────────────────────────────

@router.get("/", dependencies=[Depends(require_permission("products.read"))])
def list_products(
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
    type: Optional[ProductType] = Query(None),
    q: Optional[str] = Query(None, max_length=120, description="ad/sku/barkod arama"),
    only_active: bool = Query(False),
):
    qry = db.query(Product).filter(Product.tenant_id == tenant.id)
    if type is not None:
        qry = qry.filter(Product.type == type)
    if only_active:
        qry = qry.filter(Product.is_active.is_(True))
    if q:
        like = f"%{q}%"
        qry = qry.filter(
            (Product.name.ilike(like))
            | (Product.sku.ilike(like))
            | (Product.barcode.ilike(like))
        )
    rows = qry.order_by(Product.created_at.desc()).limit(500).all()
    return [_serialize(p) for p in rows]


@router.post("/", status_code=201, dependencies=[Depends(require_permission("products.create"))])
def create_product(
    body: ProductCreateIn,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    _check_slug(body.seo_slug)

    # SKU ve slug benzersizlik
    if body.sku and db.query(Product).filter(Product.tenant_id == tenant.id, Product.sku == body.sku).first():
        raise HTTPException(status_code=409, detail="Bu SKU zaten kullanılıyor")
    if body.seo_slug and db.query(Product).filter(Product.tenant_id == tenant.id, Product.seo_slug == body.seo_slug).first():
        raise HTTPException(status_code=409, detail="Bu SEO slug zaten kullanılıyor")

    p = Product(
        tenant_id=tenant.id,
        type=body.type,
        name=body.name,
        sku=body.sku or None,
        barcode=body.barcode or None,
        qr_code=body.qr_code or None,
        short_description=body.short_description,
        long_description=body.long_description,
        features=_normalize_features(body.features),
        price=body.price,
        currency=body.currency,
        vat_rate=body.vat_rate,
        unit=body.unit,
        stock_quantity=None if body.type == ProductType.service else body.stock_quantity,
        min_stock=None if body.type == ProductType.service else body.min_stock,
        seo_title=body.seo_title,
        seo_description=body.seo_description,
        seo_slug=body.seo_slug or None,
        is_active=body.is_active,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return _serialize(p)


@router.get("/{product_id}", dependencies=[Depends(require_permission("products.read"))])
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    p = db.query(Product).filter(Product.id == product_id, Product.tenant_id == tenant.id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    return _serialize(p)


@router.patch("/{product_id}", dependencies=[Depends(require_permission("products.update"))])
def update_product(
    product_id: int,
    body: ProductUpdateIn,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    p = db.query(Product).filter(Product.id == product_id, Product.tenant_id == tenant.id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")

    data = body.model_dump(exclude_unset=True)
    _check_slug(data.get("seo_slug"))

    # SKU çakışma
    new_sku = data.get("sku")
    if new_sku and new_sku != p.sku:
        if db.query(Product).filter(Product.tenant_id == tenant.id, Product.sku == new_sku, Product.id != p.id).first():
            raise HTTPException(status_code=409, detail="Bu SKU zaten kullanılıyor")

    # Slug çakışma
    new_slug = data.get("seo_slug")
    if new_slug and new_slug != p.seo_slug:
        if db.query(Product).filter(Product.tenant_id == tenant.id, Product.seo_slug == new_slug, Product.id != p.id).first():
            raise HTTPException(status_code=409, detail="Bu SEO slug zaten kullanılıyor")

    if "features" in data:
        data["features"] = _normalize_features(body.features)

    for key, value in data.items():
        # Boş string'leri NULL yap (frontend boş bırakırsa)
        if isinstance(value, str) and value == "":
            value = None
        setattr(p, key, value)

    # Hizmet ise stok alanlarını temizle
    if p.type == ProductType.service:
        p.stock_quantity = None
        p.min_stock = None

    db.commit()
    db.refresh(p)
    return _serialize(p)


@router.delete("/{product_id}", status_code=204, dependencies=[Depends(require_permission("products.delete"))])
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    tenant: Tenant = Depends(get_current_tenant),
):
    """Soft delete — kayıt korunur, is_active=False olur."""
    p = db.query(Product).filter(Product.id == product_id, Product.tenant_id == tenant.id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı")
    p.is_active = False
    db.commit()
    return None
