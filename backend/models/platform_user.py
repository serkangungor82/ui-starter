from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from database import Base


class PlatformUser(Base):
    """Sistem sahibi tarafında, tenant'lara ait olmayan kullanıcı.

    Platform kullanıcıları tüm tenant'ları görebilir/yönetebilir. Tenant
    kullanıcılarından (User) tamamen ayrı tabloda; auth flow'u da ayrı.
    """
    __tablename__ = "platform_users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
