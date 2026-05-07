"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getMe, type UserMe } from "@/lib/api";

export default function AccountPage() {
  const { locale } = useParams<{ locale: string }>();
  const isTr = locale === "tr";
  const [me, setMe] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe().then((r) => setMe(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-muted-foreground">{isTr ? "Yükleniyor..." : "Loading..."}</div>;
  if (!me) return null;

  return (
    <div className="flex-1 overflow-y-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{isTr ? "Hesabım" : "My Account"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isTr ? "Profilini ve şirket içi yetkilerini görüntüle." : "View your profile and tenant permissions."}
        </p>
      </div>

      <div className="glass-card p-6 text-card-foreground">
        <h2 className="mb-4 text-base font-bold">{isTr ? "Profil Bilgileri" : "Profile Info"}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={isTr ? "Ad Soyad" : "Full name"} value={`${me.first_name ?? ""} ${me.last_name ?? ""}`.trim() || "—"} />
          <Field label={isTr ? "E-posta" : "Email"} value={me.email} verified={me.email_verified} />
          <Field label={isTr ? "GSM No." : "Mobile"} value={me.phone || "—"} verified={me.phone && me.phone_verified ? true : me.phone ? false : undefined} />
          <Field
            label={isTr ? "Üyelik" : "Member since"}
            value={me.created_at ? new Date(me.created_at).toLocaleDateString(isTr ? "tr-TR" : "en-US") : "—"}
          />
        </div>
      </div>

      <div className="glass-card p-6 text-card-foreground">
        <h2 className="mb-4 text-base font-bold">{isTr ? "Şirket ve Yetki" : "Tenant & Role"}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={isTr ? "Şirket" : "Company"} value={me.tenant?.name ?? "—"} />
          <Field label={isTr ? "Alt domain" : "Subdomain"} value={me.tenant?.slug ?? "—"} />
          <Field label={isTr ? "Rol" : "Role"} value={me.role?.name ?? "—"} />
          <Field label={isTr ? "Hesap durumu" : "Account status"} value={me.is_active ? (isTr ? "Aktif" : "Active") : (isTr ? "Pasif" : "Inactive")} />
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
        <p className="text-sm font-semibold text-foreground">
          {isTr ? "Buraya kendi hesap bölümlerini ekle" : "Add your own account sections here"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {isTr
            ? "Şifre değiştirme, 2FA, fatura adresi gibi modüller için bu sayfayı genişletebilirsin."
            : "Extend this page with password change, 2FA, billing, etc."}
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
            {verified ? "✓" : "!"}
          </span>
        )}
      </div>
    </div>
  );
}
