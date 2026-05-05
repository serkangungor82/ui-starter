"use client";

export default function SettingsPage() {
  return (
    <div className="flex-1 overflow-y-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Ayarlar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Hesap ve uygulama ayarlarını buradan yönet.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          { title: "Şifre & Güvenlik", desc: "Şifre değiştirme, 2FA, oturum yönetimi" },
          { title: "Bildirim Tercihleri", desc: "E-posta ve uygulama içi bildirim ayarları" },
          { title: "API Anahtarları", desc: "Programatik erişim için anahtarlar" },
          { title: "Webhook'lar", desc: "Olay tabanlı entegrasyon noktaları" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-sm">
            <p className="text-sm font-bold text-foreground">{s.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
            <p className="mt-3 text-[11px] text-muted-foreground">Bu modülü starter'a göre uyarla.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
