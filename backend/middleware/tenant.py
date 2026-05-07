from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from database import SessionLocal
from models.tenant import Tenant


# Tenant slug olarak alınamayacak, platform/altyapı için ayrılmış subdomain'ler.
RESERVED_SLUGS = {
    "platform",
    "admin",
    "api",
    "www",
    "app",
    "mail",
    "ftp",
    "ns",
    "status",
    "static",
    "assets",
    "cdn",
    "dev",
    "test",
}


def _extract_subdomain(host: str) -> str | None:
    """`demo.localhost:8000` → `demo`, `localhost:8000` → None.

    En az 2 parça (subdomain + host) varsa subdomain döner; tek parça (root host)
    veya ip adresi → None.
    """
    if not host:
        return None
    hostname = host.split(":", 1)[0]
    parts = hostname.split(".")
    if len(parts) < 2:
        return None
    sub = parts[0].lower()
    if not sub:
        return None
    return sub


class TenantMiddleware(BaseHTTPMiddleware):
    """Host header'ından tenant slug'ı türetip request.state üzerine koyar.

    Set edilen state:
      - `request.state.tenant_id` (int | None)
      - `request.state.tenant_slug` (str | None)
      - `request.state.is_platform_host` (bool) — `platform.<host>` ise True
    """

    async def dispatch(self, request: Request, call_next):
        request.state.tenant_id = None
        request.state.tenant_slug = None
        request.state.is_platform_host = False

        host = request.headers.get("host", "")
        subdomain = _extract_subdomain(host)

        if subdomain == "platform":
            request.state.is_platform_host = True
        elif subdomain and subdomain not in RESERVED_SLUGS:
            db = SessionLocal()
            try:
                tenant = db.query(Tenant).filter(Tenant.slug == subdomain).first()
                if tenant:
                    request.state.tenant_id = tenant.id
                    request.state.tenant_slug = tenant.slug
            finally:
                db.close()

        return await call_next(request)
