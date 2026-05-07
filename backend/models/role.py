from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class Role(Base):
    """Tenant'a ait bir rol. Aynı isimle iki rol tek tenant içinde olamaz.

    `is_system=True` rolleri tenant create edildiğinde otomatik oluşturulur
    (Owner/Admin/Member) ve silinemez/yeniden adlandırılamaz. Tenant Admin'i
    kendi özel rollerini (`is_system=False`) tanımlayabilir.
    """
    __tablename__ = "roles"
    __table_args__ = (
        UniqueConstraint("tenant_id", "name", name="uq_roles_tenant_name"),
    )

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(
        Integer,
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    is_system = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    permissions = relationship(
        "Permission",
        secondary="role_permissions",
        lazy="selectin",
    )
