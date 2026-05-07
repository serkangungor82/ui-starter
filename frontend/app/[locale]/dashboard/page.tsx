"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getMe, type UserMe } from "@/lib/api";

export default function DashboardHome() {
  const { locale } = useParams<{ locale: string }>();
  const isTr = locale === "tr";
  const [me, setMe] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((r) => setMe(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600 dark:border-indigo-500/30 dark:border-t-indigo-400" />
      </div>
    );
  }
  if (!me) return null;

  const fullName =
    me.first_name || me.last_name
      ? `${me.first_name ?? ""} ${me.last_name ?? ""}`.trim()
      : me.email;

  return (
    <div className="flex-1 overflow-y-auto space-y-5">
      {/* Hoşgeldin kartı */}
      <div className="glass-card p-6 text-card-foreground">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-base font-black text-white shadow-sm">
            {((me.first_name?.[0] ?? "") + (me.last_name?.[0] ?? "")).toUpperCase() || me.email[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-foreground">
              {isTr ? "Hoşgeldin" : "Welcome"}, {fullName}
            </p>
            <p className="text-sm text-muted-foreground">
              {me.tenant
                ? isTr
                  ? `${me.tenant.name} panelinde ${me.role?.name ?? "—"} rolü ile giriş yaptın.`
                  : `Signed in to ${me.tenant.name} as ${me.role?.name ?? "—"}.`
                : isTr
                ? "Panele hoş geldin."
                : "Welcome to the panel."}
            </p>
          </div>
          {me.tenant?.status === "trial" && (
            <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
              {isTr ? "Deneme" : "Trial"}
            </span>
          )}
        </div>
      </div>

      {/* Özet kartları */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          title={isTr ? "Tenant" : "Tenant"}
          value={me.tenant?.name ?? "—"}
          hint={me.tenant?.slug ? `${me.tenant.slug}.localhost` : undefined}
        />
        <SummaryCard
          title={isTr ? "Rolüm" : "My Role"}
          value={me.role?.name ?? "—"}
          hint={me.role?.is_system ? (isTr ? "Sistem rolü" : "System role") : (isTr ? "Özel rol" : "Custom role")}
        />
        <SummaryCard
          title={isTr ? "Yetkiler" : "Permissions"}
          value={String(me.permissions.length)}
          hint={isTr ? "permission tanımlı" : "permissions granted"}
        />
      </div>

      {/* Permission listesi */}
      <div className="glass-card p-5 text-card-foreground">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {isTr ? "Sahip olduğun yetkiler" : "Your permissions"}
        </p>
        {me.permissions.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {isTr ? "Henüz bir yetkin yok." : "You don't have any permissions yet."}
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {me.permissions.map((p) => (
              <span
                key={p}
                className="rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
              >
                {p}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="glass-card p-5 text-card-foreground">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
      <p className="mt-2 truncate text-2xl font-bold text-foreground" title={value}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
