from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # JWT
    SECRET_KEY: str = "change-me-in-production-please-use-a-long-random-string"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database — SQLite varsayılan; prod için DATABASE_URL ile postgres/mysql geç
    DATABASE_URL: str = "sqlite:///./app.db"

    # CORS — virgülle ayrılmış kaynaklar
    CORS_ORIGINS: str = "http://localhost:3000"

    # Microsoft OAuth (kurumsal hesap girişi)
    # Boş ise endpoint /auth/login?error=microsoft_not_configured'a yönlendirir.
    # Azure App Registration: Authority = https://login.microsoftonline.com/organizations
    # (sadece organizational/work hesapları, kişisel reddedilir).
    MS_CLIENT_ID: str = ""
    MS_CLIENT_SECRET: str = ""
    # Backend OAuth callback URL — Azure'da Redirect URI olarak register edilmeli.
    # Örn: http://api.localhost:8000/auth/microsoft/callback
    MS_REDIRECT_URI: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
