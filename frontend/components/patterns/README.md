# Patterns

Opsiyonel, copy-paste edilebilir UI patern'leri. Backend sözleşmeleri her klasörün kendi README'sinde.

| Pattern | Açıklama |
|---|---|
| [`NotificationBell`](./NotificationBell/) | Header bildirim çanı. Açıldığında okunmamışları otomatik okundu yapar. |
| [`KvkkModal`](./KvkkModal/) | Türkiye KVKK aydınlatma + açık rıza modali. SMS ile doğrulama akışı içerir. |

## Felsefe

- Her pattern **kendi içinde** çalışır — projenin axios setup'ına göre prop olarak callback alır.
- npm paketi olmaktan kaçınılır; kopyala/yapıştır + ihtiyaca göre düzenle.
- Tailwind class'larıyla stillenmiştir; renk paletini değiştirmek için kendi inline'ında değiştir.
