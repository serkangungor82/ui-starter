"""Code-tanımlı permission registry.

Bu listenin tek doğruluk kaynağı (single source of truth) burasıdır. Yeni
permission eklemek = bu listeye yeni `Permission` ekleyip seed'i tekrar
çalıştırmak. DB seed işlemi `seed_permissions()` ile idempotent şekilde
permission tablosunu bu listeye eşitler.

Naming convention: `<resource>.<action>`
  - resource: çoğul (`users`, `contacts`, `deals`)
  - action: `read | create | update | delete` (gerekirse `manage` veya
    domain'e özgü ekstra fiil)
"""
from dataclasses import dataclass


@dataclass(frozen=True)
class PermissionDef:
    key: str
    name: str
    description: str


# Tenant-scope permission'lar. Her biri tenant kullanıcısı (User) bağlamında
# anlamlı; PlatformUser bunlara tabi değildir.
PERMISSIONS: list[PermissionDef] = [
    # Kullanıcı yönetimi
    PermissionDef("users.read", "Kullanıcıları görüntüle", "Tenant'taki kullanıcıları listele/oku"),
    PermissionDef("users.create", "Kullanıcı ekle", "Yeni kullanıcı davet et / oluştur"),
    PermissionDef("users.update", "Kullanıcı düzenle", "Kullanıcı bilgileri ve rol atama"),
    PermissionDef("users.delete", "Kullanıcı sil", "Kullanıcıyı sil veya pasifleştir"),
    # Rol yönetimi
    PermissionDef("roles.read", "Rolleri görüntüle", "Tenant rollerini listele"),
    PermissionDef("roles.create", "Rol oluştur", "Yeni özel rol tanımla"),
    PermissionDef("roles.update", "Rol düzenle", "Rol adı veya permission'ları değiştir"),
    PermissionDef("roles.delete", "Rol sil", "Özel rol sil (sistem rolleri silinemez)"),
    # Ürün ve Hizmet kataloğu
    PermissionDef("products.read", "Ürün görüntüle", "Ürün/hizmet kataloğunu oku"),
    PermissionDef("products.create", "Ürün oluştur", "Yeni ürün veya hizmet ekle"),
    PermissionDef("products.update", "Ürün düzenle", "Mevcut ürün/hizmet kaydını güncelle"),
    PermissionDef("products.delete", "Ürün sil", "Ürün/hizmet kaydını sil veya pasifleştir"),
    # Domain örnek — Contact
    PermissionDef("contacts.read", "Contact görüntüle", "Müşteri/kişi kayıtlarını oku"),
    PermissionDef("contacts.create", "Contact oluştur", "Yeni kişi kaydı"),
    PermissionDef("contacts.update", "Contact düzenle", "Kişi kaydını güncelle"),
    PermissionDef("contacts.delete", "Contact sil", "Kişi kaydını sil"),
    # Domain örnek — Deal
    PermissionDef("deals.read", "Fırsat görüntüle", "Satış fırsatlarını oku"),
    PermissionDef("deals.create", "Fırsat oluştur", "Yeni fırsat"),
    PermissionDef("deals.update", "Fırsat düzenle", "Fırsat bilgisi veya stage'i"),
    PermissionDef("deals.delete", "Fırsat sil", "Fırsat sil"),
    # Domain örnek — Activity
    PermissionDef("activities.read", "Aktivite görüntüle", "Görüşme/email/not kayıtlarını oku"),
    PermissionDef("activities.create", "Aktivite oluştur", "Yeni aktivite kaydı"),
    PermissionDef("activities.update", "Aktivite düzenle", "Aktivite kaydını güncelle"),
    PermissionDef("activities.delete", "Aktivite sil", "Aktivite kaydını sil"),
    # Tenant ayarları
    PermissionDef("settings.read", "Ayarları görüntüle", "Tenant ayarlarını oku"),
    PermissionDef("settings.update", "Ayarları düzenle", "Tenant ayarlarını değiştir"),
]


# Permission key set'i — fast lookup için
PERMISSION_KEYS: set[str] = {p.key for p in PERMISSIONS}


# Sistem role'lerinin permission listesi. Tenant create edildiğinde bu üç
# rol otomatik oluşturulur (`tenant_setup.initialize_tenant_roles`).
DEFAULT_ROLE_PERMISSIONS: dict[str, set[str]] = {
    "Owner": PERMISSION_KEYS,  # Hepsi
    "Admin": PERMISSION_KEYS - {
        # Admin rol yaratamaz/silemez/düzenleyemez (sadece Owner) — ama
        # roles.read kalır: kullanıcıya rol atarken listeyi görmesi lazım.
        "roles.create",
        "roles.update",
        "roles.delete",
        # Admin tenant ayarlarını değiştiremez (sadece Owner)
        "settings.update",
    },
    "Member": {
        "products.read",
        "products.create",
        "products.update",
        "contacts.read",
        "contacts.create",
        "contacts.update",
        "deals.read",
        "deals.create",
        "deals.update",
        "activities.read",
        "activities.create",
        "activities.update",
    },
}
