"""Permission-bazlı erişim kontrolü için FastAPI dependency'leri."""
from fastapi import Depends, HTTPException

from models.user import User
from routers.auth import get_current_user


def user_permission_keys(user: User) -> set[str]:
    """Kullanıcının role'üne bağlı permission key seti. Role yoksa boş set."""
    if not user.role:
        return set()
    return {p.key for p in user.role.permissions}


def require_permission(key: str):
    """Endpoint'e tek satır izin koruması:

        @router.get("/users", dependencies=[Depends(require_permission("users.read"))])

    Kullanıcının rolünün permission'ları arasında `key` yoksa 403.
    """

    def _checker(current_user: User = Depends(get_current_user)) -> User:
        if key not in user_permission_keys(current_user):
            raise HTTPException(
                status_code=403,
                detail=f"Bu işlem için '{key}' yetkisi gerekli",
            )
        return current_user

    return _checker
