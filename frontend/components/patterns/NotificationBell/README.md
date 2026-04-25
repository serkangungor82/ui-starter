# NotificationBell

Header'a yerleştirilen bildirim çanı. Açıldığında okunmamış bildirimler otomatik okundu işaretlenir; tek tek okuma da mümkündür.

## Kullanım

```tsx
import NotificationBell from "@/components/patterns/NotificationBell/NotificationBell";
import { listNotifications, markRead, markAllRead } from "@/lib/api";

<NotificationBell
  fetcher={() => listNotifications().then((r) => r.data)}
  markRead={markRead}
  markAllRead={markAllRead}
/>
```

## Props

| Prop | Tip | Açıklama |
|---|---|---|
| `fetcher` | `() => Promise<Notification[]>` | Bildirim listesini getirir |
| `markRead` | `(id) => Promise<unknown>` | Tek okundu işaretle |
| `markAllRead` | `() => Promise<unknown>` | Tümünü okundu işaretle |
| `formatDate` | `(iso) => string` | Default `tr-TR` |
| `emptyText` | `string` | Default "Bildirim yok" |
| `title` | `string` | Default "Bildirimler" |
| `markAllText` | `string` | Default "Tümünü okundu işaretle" |

## Backend sözleşmesi

```
GET  /notifications/       -> Notification[]
POST /notifications/{id}/read
POST /notifications/read-all
```

`Notification` tipi: `{ id, title, message, type: "info"|"warning"|"danger", read, created_at }`

## Davranış notu

Cana tıklandığında menü açılırken **eğer okunmamış varsa otomatik tümü okundu yapılır**. Bu davranışı değiştirmek istersen `handleMarkAll()` çağrısını component içinde kaldır.
