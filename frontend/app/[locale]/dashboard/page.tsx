"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getMe } from "@/lib/api";

export default function DashboardHome() {
  const { locale } = useParams<{ locale: string }>();
  const isTr = locale === "tr";
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((r) => setUser(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }
  if (!user) return null;

  const fullName =
    user.first_name || user.last_name
      ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
      : user.email;

  return (
    <div className="flex-1 overflow-y-auto space-y-5">
      {/* Hoşgeldin kartı */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-base font-black text-white shadow-sm">
            {((user.first_name?.[0] ?? "") + (user.last_name?.[0] ?? "")).toUpperCase() || user.email[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold text-gray-900">
              {isTr ? "Hoşgeldin" : "Welcome"}, {fullName}
            </p>
            <p className="text-sm text-gray-500">
              {isTr
                ? "UI Starter ile sıfırdan modern bir Next.js iskeletine sahipsin."
                : "You're up and running with a modern Next.js skeleton."}
            </p>
          </div>
        </div>
      </div>

      {/* Placeholder kart grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { title: isTr ? "İstatistik #1" : "Stat #1", value: "—" },
          { title: isTr ? "İstatistik #2" : "Stat #2", value: "—" },
          { title: isTr ? "İstatistik #3" : "Stat #3", value: "—" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{s.title}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="mt-1 text-xs text-gray-400">
              {isTr ? "Buraya kendi metriğini ekleyebilirsin." : "Plug in your own metric here."}
            </p>
          </div>
        ))}
      </div>

      {/* Yer tutucu içerik bloku */}
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
        <p className="text-sm font-semibold text-gray-700">
          {isTr ? "Buraya kendi içeriğini ekle" : "Add your own content here"}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {isTr
            ? "Bu sayfa yeni proje şablonu için boş bir karşılama ekranıdır."
            : "This is a placeholder landing for your dashboard."}
        </p>
      </div>
    </div>
  );
}
