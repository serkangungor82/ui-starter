import enum
from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
from database import Base


class TenantStatus(str, enum.Enum):
    trial = "trial"
    active = "active"
    suspended = "suspended"


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(63), unique=True, nullable=False, index=True)
    status = Column(Enum(TenantStatus), nullable=False, default=TenantStatus.trial)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
