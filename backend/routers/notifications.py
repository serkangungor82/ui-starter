from fastapi import APIRouter, Depends

from models.user import User
from routers.auth import get_current_user


router = APIRouter(prefix="/notifications", tags=["notifications"])


# Stub: starter'a özel basit liste. Kendi modeline (Notification) bağlamak için
# routes ve servisleri buraya ekleyebilirsin.

@router.get("/")
def list_notifications(current_user: User = Depends(get_current_user)):
    return []


@router.post("/{notification_id}/read")
def mark_read(notification_id: int, current_user: User = Depends(get_current_user)):
    return {"ok": True}


@router.post("/read-all")
def mark_all_read(current_user: User = Depends(get_current_user)):
    return {"ok": True}
