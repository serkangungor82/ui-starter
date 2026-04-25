# UI Starter — Full-Stack

Next.js (frontend) + FastAPI (backend) ortak bir iskelet. Yeni projelere hızlı başlangıç sağlar.

## İçerik

- **Frontend** (`frontend/`)
  - Next.js 16 + Tailwind + i18n (TR/EN)
  - Auth UI: login, register, forgot/reset, verify, OAuth callback
  - Dashboard + admin layout (sidebar, bildirim çanı)
  - **Pattern komponentleri** (`components/patterns/`): NotificationBell, KvkkModal — copy-paste edilebilir, kendi sözleşmesi olan opsiyonel parçalar
  - **Storybook** ile component katalog
- **Backend** (`backend/`)
  - FastAPI + SQLAlchemy + JWT
  - SQLite varsayılan (Postgres'e geçiş tek satır)
  - Auth endpoint'leri: register / login / me / verify / forgot / reset
  - Bildirim stub'ı

## Hızlı başlangıç

İki terminal açıp ikisini de çalıştır:

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload   # http://localhost:8000
```

```bash
# Frontend
cd frontend
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev                         # http://localhost:3000
```

Türkçe için `/tr`, İngilizce için `/en`.

## Storybook

```bash
cd frontend
npm run storybook   # http://localhost:6006
```

## Docker (lokal full stack)

```bash
docker compose up --build
```

Frontend `:3000`, backend `:8000` üzerinde açılır.

## Yapı

```
ui-starter/
├── frontend/                    # Next.js app
│   ├── app/[locale]/            # auth, dashboard, admin
│   ├── components/
│   │   ├── patterns/            # NotificationBell, KvkkModal (opsiyonel)
│   │   └── layout/              # Navbar
│   ├── lib/api.ts               # axios + auth endpoint sözleşmeleri
│   ├── messages/                # tr.json, en.json
│   ├── .storybook/              # Storybook config
│   └── ...
├── backend/                     # FastAPI app
│   ├── main.py
│   ├── config.py, database.py
│   ├── models/                  # User, VerificationCode
│   ├── routers/                 # auth, notifications
│   └── services/security.py     # JWT + password hashing
└── docker-compose.yml
```

## Lisans

İç kullanım için. Yeni projelere göre özgürce uyarla.
