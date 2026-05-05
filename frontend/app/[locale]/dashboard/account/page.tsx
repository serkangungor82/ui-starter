"use client";

import { useEffect, useState } from "react";
import { getMe } from "@/lib/api";

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe().then((r) => setUser(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-muted-foreground">Yükleniyor...</div>;
  if (!user) return null;

  return (
    <div className="flex-1 overflow-y-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Hesabım</h1>
        <p className="mt-1 text-sm text-muted-foreground">Profilini düzenle, güvenlik ayarlarını yönet.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <h2 className="mb-4 text-base font-bold">Profil Bilgileri</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Ad Soyad" value={`${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "—"} />
          <Field label="E-posta" value={user.email} verified={user.email_verified} />
          <Field label="Telefon" value={user.phone || "—"} verified={user.phone_verified} />
          <Field label="Üyelik" value={user.created_at ? new Date(user.created_at).toLocaleDateString("tr-TR") : "—"} />
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
        <p className="text-sm font-semibold text-foreground">Buraya kendi hesap bölümlerini ekle</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Şifre değiştirme, 2FA, fatura adresi, hesap silme gibi modüller için bu sayfayı genişletebilirsin.
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, verified }: { label: string; value: string; verified?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <p className="text-sm font-medium text-foreground">{value}</p>
        {verified !== undefined && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              verified
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
            }`}
          >
            {verified ? "Doğrulandı" : "Doğrulanmadı"}
          </span>
        )}
      </div>
    </div>
  );
}
