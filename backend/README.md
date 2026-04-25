# Backend (FastAPI)

Auth iskeleti. SQLite varsayılan, JWT auth, register/login/me/forgot/reset/verify endpoint'leri.

## Kurulum

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # ihtiyacın varsa düzenle
uvicorn main:app --reload
```

`http://localhost:8000` üzerinde çalışır. Otomatik dokümantasyon: `http://localhost:8000/docs`.

## Endpoint'ler

| Metod | Yol | Açıklama |
|---|---|---|
| POST | `/auth/register` | Yeni kullanıcı oluştur (e-posta doğrulama kodu üretir, konsola yazar) |
| POST | `/auth/login` | `{ access_token }` döndürür |
| GET | `/auth/me` | Bearer token ile mevcut kullanıcı |
| GET | `/auth/me/logins` | Giriş geçmişi (stub — boş döner) |
| POST | `/auth/verify` | E-posta veya SMS doğrulama (`{channel, code}`) |
| POST | `/auth/me/resend-verification` | Yeni kod gönder |
| POST | `/auth/forgot-password` | Şifre sıfırlama kodu üret |
| POST | `/auth/reset-password` | Kod ile yeni şifre belirle |
| GET | `/notifications/` | (Stub) bildirim listesi |
| GET | `/health` | Sağlık kontrolü |

## E-posta / SMS gönderim

`services/security.py` JWT ile sınırlı; doğrulama kodu üretimi `routers/auth.py:_create_verification` içinde — şu an konsola yazıyor. Production'a geçmeden önce bunu Resend / Postmark / MobilDev gibi bir provider entegrasyonuyla değiştirmen gerekir.

## Production notları

- `SECRET_KEY`'i mutlaka uzun random bir değerle değiştir.
- SQLite yerine PostgreSQL'e geç: `DATABASE_URL=postgresql+psycopg://...` (psycopg paketi requirements'a ekle).
- Tablolar `Base.metadata.create_all` ile otomatik açılıyor; ciddi projelerde Alembic migration kullan.
- Rate limiting (örn. slowapi) ve `/auth/login` için brute-force koruması ekle.
