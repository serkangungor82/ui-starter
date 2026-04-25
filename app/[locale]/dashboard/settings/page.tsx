"use client";

export default function SettingsPage() {
  return (
    <div className="flex-1 overflow-y-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Ayarlar</h1>
        <p className="mt-1 text-sm text-gray-500">Hesap ve uygulama ayarlarını buradan yönet.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          { title: "Şifre & Güvenlik", desc: "Şifre değiştirme, 2FA, oturum yönetimi" },
          { title: "Bildirim Tercihleri", desc: "E-posta ve uygulama içi bildirim ayarları" },
          { title: "API Anahtarları", desc: "Programatik erişim için anahtarlar" },
          { title: "Webhook'lar", desc: "Olay tabanlı entegrasyon noktaları" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-gray-900">{s.title}</p>
            <p className="mt-1 text-xs text-gray-500">{s.desc}</p>
            <p className="mt-3 text-[11px] text-gray-400">Bu modülü starter'a göre uyarla.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
