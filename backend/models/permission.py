from sqlalchemy import Column, Integer, String
from database import Base


class Permission(Base):
    """Code-tanımlı permission listesinin DB karşılığı.

    Tek doğruluk kaynağı `services/permissions.py`'daki `PERMISSIONS`
    listesidir; bu tablo seed ile o listeye senkronlanır.
    """
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
