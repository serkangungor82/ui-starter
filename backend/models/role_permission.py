from sqlalchemy import Column, Integer, ForeignKey
from database import Base


class RolePermission(Base):
    """Role ↔ Permission many-to-many join tablosu."""
    __tablename__ = "role_permissions"

    role_id = Column(
        Integer,
        ForeignKey("roles.id", ondelete="CASCADE"),
        primary_key=True,
    )
    permission_id = Column(
        Integer,
        ForeignKey("permissions.id", ondelete="CASCADE"),
        primary_key=True,
    )
