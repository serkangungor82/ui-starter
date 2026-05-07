"""Microsoft OAuth (kurumsal hesap girişi) — başlangıç + callback.

Kurumsal/organizational hesap kısıtı: Azure authorize URL'inde tenant olarak
`organizations` kullanırız → Microsoft kişisel hesapları daha login ekranında
reddeder. Kullanıcı doğrulandıktan sonra callback'te email ile tenant'taki
User'a eşleştirip JWT üretiriz; eşleşme yoksa not_registered hatası.

Bu PR'da skeleton + config kontrol var; tam OAuth flow (token exchange,
Microsoft Graph profile, email lookup) ayrı PR'da bağlanacak.
"""
from urllib.parse import urlencode

from fastapi import APIRouter, Depends, Query
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models.tenant import Tenant
from routers.auth import get_current_tenant


router = APIRouter(prefix="/auth/microsoft", tags=["oauth-microsoft"])


def _login_redirect(tenant: Tenant, locale: str, error: str | None = None) -> RedirectResponse:
    qs = f"?error={error}" if error else ""
    url = f"http://{tenant.slug}.localhost:3000/{locale}/auth/login{qs}"
    return RedirectResponse(url, status_code=302)


@router.get("")
def microsoft_start(
    locale: str = Query("tr", regex="^(tr|en)$"),
    tenant: Tenant = Depends(get_current_tenant),
):
    """Microsoft authorize sayfasına yönlendirir.

    Konfigürasyon (MS_CLIENT_ID, MS_REDIRECT_URI) eksikse, kullanıcıyı
    tenant'ın login sayfasına `?error=microsoft_not_configured` ile döndürür.
    """
    if not settings.MS_CLIENT_ID or not settings.MS_REDIRECT_URI:
        return _login_redirect(tenant, locale, error="microsoft_not_configured")

    # state: callback'te tenant + locale ayrıştırılır.
    state = f"tenant={tenant.slug}&locale={locale}"
    params = {
        "client_id": settings.MS_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": settings.MS_REDIRECT_URI,
        "response_mode": "query",
        "scope": "openid profile email User.Read",
        "state": state,
        # `prompt=select_account` her seferinde hesap seçimi gösterir
        "prompt": "select_account",
    }
    # `organizations` tenant'ı: yalnızca kurumsal/work hesapları
    authorize_url = (
        "https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize?"
        + urlencode(params)
    )
    return RedirectResponse(authorize_url, status_code=302)


@router.get("/callback")
def microsoft_callback(
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
    db: Session = Depends(get_db),
):
    """Microsoft callback — token exchange + email match → JWT.

    NOT: Tam implement sonraki PR'da. Şimdilik state'i parse edip kullanıcıyı
    'microsoft_not_configured' ile login'e geri gönderiyoruz.
    """
    # state'i parse et — tenant + locale yakala
    state_kv = dict(item.split("=", 1) for item in (state or "").split("&") if "=" in item)
    tenant_slug = state_kv.get("tenant")
    locale = state_kv.get("locale", "tr")

    tenant = None
    if tenant_slug:
        tenant = db.query(Tenant).filter(Tenant.slug == tenant_slug).first()

    if not tenant:
        # Anonymous fallback — bağlam kaybolduğunda root'a
        return RedirectResponse("http://localhost:3000/", status_code=302)

    # Microsoft tarafından kullanıcı reddedildiyse (örn personal account)
    if error:
        if error in ("invalid_request", "unauthorized_client"):
            return _login_redirect(tenant, locale, error="personal_account_not_allowed")
        return _login_redirect(tenant, locale, error=error)

    # Tam flow buradan devam edecek (sonraki PR):
    # 1) code → token exchange (POST /token)
    # 2) id_token decode → email + tid (kurumsal Azure tenant ID kontrol)
    # 3) tenant içinde User.email lookup
    # 4) eşleşme varsa create_tenant_token → frontend callback page
    # 5) eşleşme yoksa → ?error=not_registered

    return _login_redirect(tenant, locale, error="microsoft_not_configured")
