# KvkkModal

Türkiye KVKK uyumluluğu için aydınlatma metni + açık rıza beyanı modali. SMS ile kimlik doğrulama akışı içerir.

## Kullanım

```tsx
import { useEffect, useState } from "react";
import KvkkModal from "@/components/patterns/KvkkModal/KvkkModal";
import { api, getMe } from "@/lib/api";

const AYDINLATMA_METNI = `Şirketinizin İsmi ("Veri Sorumlusu") olarak 6698 sayılı KVKK ...`;

function MyLayout() {
  const [show, setShow] = useState(false);
  const [phone, setPhone] = useState<string | null>(null);

  useEffect(() => {
    getMe().then((r) => {
      if (!r.data.kvkk_accepted_at && !r.data.is_admin) {
        setShow(true);
        setPhone(r.data.phone);
      }
    });
  }, []);

  return (
    <>
      {/* ... */}
      {show && (
        <KvkkModal
          phone={phone}
          aydinlatmaMetni={AYDINLATMA_METNI}
          onSendSms={() => api.post("/auth/me/kvkk/send-sms")}
          onVerify={(code) => api.post("/auth/me/kvkk/verify", { code })}
          onDecline={() => api.post("/auth/me/kvkk/decline")}
          onAccepted={() => setShow(false)}
          onDeclined={() => setShow(false)}
        />
      )}
    </>
  );
}
```

## Props

| Prop | Tip | Açıklama |
|---|---|---|
| `phone` | `string \| null` | Telefon numarasını gösterir (opsiyonel) |
| `aydinlatmaMetni` | `string` | Şirketine özel KVKK aydınlatma metni |
| `onSendSms` | `() => Promise<unknown>` | Backend'e SMS göndermesi için sinyal |
| `onVerify` | `(code) => Promise<unknown>` | Kodu doğrula; başarılıysa resolve, hatalıysa throw |
| `onDecline` | `() => Promise<unknown>` | Reddi backend'e bildir |
| `onAccepted` | `() => void` | Doğrulama başarılı olduktan sonra |
| `onDeclined` | `() => void` | Reddedildikten sonra |

## Backend sözleşmesi (örnek)

```
POST /auth/me/kvkk/send-sms     -> SMS gönderir
POST /auth/me/kvkk/verify       -> { code } - doğrular ve kvkk_accepted_at=NOW()
POST /auth/me/kvkk/decline      -> Reddi kayıt eder
```

User modelinde önerilen alanlar:
- `kvkk_accepted_at: datetime?` — onay tarihi
- `aydinlatma_accepted_at: datetime?` — aydınlatma okuma tarihi (opsiyonel)

## Tasarım

- Indigo header
- Yeşil onay yolu (SMS verify)
- Kırmızı red yolu

Renkleri özelleştirmek için componentin Tailwind class'larını ihtiyacına göre düzenle.
