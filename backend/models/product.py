import enum
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    Numeric,
    ForeignKey,
    Enum,
    JSON,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class ProductType(str, enum.Enum):
    product = "product"  # fiziksel ürün — stok takibi yapılır
    service = "service"  # hizmet — stok yok


class Product(Base):
    """Tenant'a ait ürün veya hizmet kataloğu kaydı.

    Tek tabloda hem ürün (stoklu) hem hizmet (stoksuz) tutulur; `type`
    alanı ile ayrılır. Service kayıtlarda stok alanları null kalır.
    """
    __tablename__ = "products"
    __table_args__ = (
        # SKU tenant içinde benzersiz; NULL'lara izin var (zorunlu değil)
        UniqueConstraint("tenant_id", "sku", name="uq_products_tenant_sku"),
        # Slug tenant içinde benzersiz (SEO URL'leri için)
        UniqueConstraint("tenant_id", "seo_slug", name="uq_products_tenant_slug"),
    )

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True)

    type = Column(Enum(ProductType), nullable=False, default=ProductType.product, index=True)
    name = Column(String(255), nullable=False)

    # ── Kodlar
    sku = Column(String(64), nullable=True, index=True)  # stock keeping unit / stok kodu
    barcode = Column(String(64), nullable=True, index=True)  # EAN-13 / UPC
    qr_code = Column(String(255), nullable=True)  # QR içeriği (URL veya seri no)

    # ── Açıklama & özellikler
    short_description = Column(String(500), nullable=True)
    long_description = Column(Text, nullable=True)  # Markdown veya HTML
    features = Column(JSON, nullable=True)  # liste: [{ "name": "Renk", "value": "Siyah" }]

    # ── Fiyat & stok
    price = Column(Numeric(14, 2), nullable=True)  # birim fiyat
    currency = Column(String(3), nullable=False, default="TRY")  # ISO 4217
    vat_rate = Column(Numeric(5, 2), nullable=True)  # KDV oranı %, örn 20.00
    unit = Column(String(20), nullable=True)  # adet, kg, lt, saat, gün, vb.
    stock_quantity = Column(Numeric(14, 3), nullable=True)  # service için NULL
    min_stock = Column(Numeric(14, 3), nullable=True)  # kritik stok seviyesi (uyarı için)

    # ── SEO
    seo_title = Column(String(255), nullable=True)
    seo_description = Column(String(500), nullable=True)
    seo_slug = Column(String(255), nullable=True, index=True)

    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    tenant = relationship("Tenant")
