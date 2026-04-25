# UI Starter

Next.js + Tailwind temelli, ortak ihtiyaçlar (auth akışı, dashboard layout, admin panel, i18n, modern UI bileşenleri) için hazır iskelet.

Bu repo MaxiContext projesinden iş mantığı temizlenip yeniden kullanılabilir bir "starter" olarak çıkartıldı.

## İçerik

- **Auth UI**: login, register, forgot/reset password, e-posta/SMS verify, OAuth callback (Google, Microsoft, GitHub butonları hazır)
- **Dashboard layout**: sidebar + header + bildirim çanı
- **Admin layout**: ayrı bir admin paneli iskeleti
- **i18n**: TR/EN, `next-intl` ile
- **UI**: Tailwind theme, gradient/animasyon utility'leri (`gradient-x`, `float`, `marquee`, `ai-dots`, `ai-shimmer`)
- **Axios + Bearer token**: `lib/api.ts`, `lib/auth.ts`
- **TypeScript** strict mode

## Kurulum

```bash
npm install        # veya pnpm install
cp .env.local.example .env.local
# .env.local içine NEXT_PUBLIC_API_URL'i kendi backend adresinle güncelle
npm run dev
```

`http://localhost:3000` üzerinde açılır. Türkçe için `/tr`, İngilizce için `/en`.

## Yapı

```
app/
  globals.css                  # Tailwind + custom animasyonlar
  [locale]/
    layout.tsx                 # i18n provider, html/body kabuğu
    page.tsx                   # Landing
    auth/                      # login, register, forgot, reset, verify, callback
    dashboard/
      layout.tsx               # Sidebar + bildirim çanı
      page.tsx                 # Karşılama
      account/, settings/, notifications/
    admin/
      layout.tsx               # Admin sidebar
      page.tsx, settings/
components/
  layout/Navbar.tsx
i18n/                          # next-intl konfig
lib/
  api.ts                       # axios + auth endpoint sözleşmeleri
  auth.ts                      # token storage
messages/
  tr.json, en.json
middleware.ts                  # locale yönlendirme
tailwind.config.js
```

## Backend bağlama

Frontend backend agnostic — `lib/api.ts` içindeki endpoint'ler şu sözleşmeyi bekler:

| Endpoint | Beklenen yanıt |
|---|---|
| `POST /auth/register` | `201` |
| `POST /auth/login` | `{ access_token: string }` |
| `POST /auth/forgot-password` | `200` |
| `POST /auth/reset-password` | `200` |
| `POST /auth/verify` | `200` |
| `GET /auth/me` | `{ id, email, first_name, last_name, phone, email_verified, phone_verified, is_admin, ... }` |
| `GET /auth/me/logins` | `[{ ip, user_agent, created_at }]` |
| `GET /notifications/` | `[{ id, title, message, type, read, created_at }]` |
| `POST /notifications/{id}/read` | `200` |
| `POST /notifications/read-all` | `200` |

OAuth için login/register sayfasındaki butonlar `${API_BASE}/auth/google`, `/auth/microsoft`, `/auth/github` adreslerine yönlendirir — backend'de bu redirect endpoint'lerini açman gerekir.

## Temalama

Renk paleti `tailwind.config.js`'de. Birincil renkler: `indigo` ve `violet`. Animasyonlar `app/globals.css` içinde.

## Lisans

İç kullanım için. Dilediğin gibi düzenleyebilirsin.
