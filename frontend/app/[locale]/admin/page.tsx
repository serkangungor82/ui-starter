"use client";

export default function AdminDashboard() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Admin Kontrol Paneli</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Yönetim ekranlarını buraya yerleştir. Bu sayfa starter için yer tutucudur.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Toplam Kullanıcı", value: "—" },
          { label: "Aktif Abonelik", value: "—" },
          { label: "Bu Ay Kayıt", value: "—" },
          { label: "Açık Talep", value: "—" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center">
        <p className="text-sm font-semibold text-foreground">Buraya admin metrikleri / grafikler eklenebilir</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Grafik bileşeni örneği için <code className="rounded bg-card px-1 py-0.5 font-mono text-[11px]">app/[locale]/admin/page.tsx</code> içine SVG bar/line chart yerleştirebilirsin.
        </p>
      </div>
    </div>
  );
}
