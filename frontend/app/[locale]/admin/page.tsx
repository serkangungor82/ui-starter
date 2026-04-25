"use client";

export default function AdminDashboard() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Admin Kontrol Paneli</h1>
        <p className="mt-1 text-sm text-gray-500">
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
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
        <p className="text-sm font-semibold text-gray-700">Buraya admin metrikleri / grafikler eklenebilir</p>
        <p className="mt-1 text-xs text-gray-400">
          Grafik bileşeni örneği için <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px]">app/[locale]/admin/page.tsx</code> içine SVG bar/line chart yerleştirebilirsin.
        </p>
      </div>
    </div>
  );
}
