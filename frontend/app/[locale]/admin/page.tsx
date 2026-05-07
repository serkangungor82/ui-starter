"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getMe,
  listTenantUsers,
  listTenantRoles,
  type UserMe,
  type TenantUserSummary,
  type TenantRoleSummary,
} from "@/lib/api";

export default function AdminHome() {
  const { locale } = useParams<{ locale: string }>();
  const isTr = locale === "tr";
  const [me, setMe] = useState<UserMe | null>(null);
  const [users, setUsers] = useState<TenantUserSummary[] | null>(null);
  const [roles, setRoles] = useState<TenantRoleSummary[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMe(), listTenantUsers(), listTenantRoles()])
      .then(([m, u, r]) => {
        setMe(m.data);
        setUsers(u.data);
        setRoles(r.data);
      })
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

  const activeUsers = users?.filter((u) => u.is_active).length ?? 0;
  const inactiveUsers = (users?.length ?? 0) - activeUsers;
  const systemRoles = roles?.filter((r) => r.is_system).length ?? 0;
  const customRoles = (roles?.length ?? 0) - systemRoles;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{isTr ? "Yönetim Paneli" : "Admin Dashboard"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {me?.tenant
            ? isTr
              ? `${me.tenant.name} için kullanıcı, rol ve ayarları yönet.`
              : `Manage users, roles and settings for ${me.tenant.name}.`
            : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title={isTr ? "Aktif Kullanıcı" : "Active Users"}
          value={String(activeUsers)}
          hint={inactiveUsers > 0 ? (isTr ? `${inactiveUsers} pasif` : `${inactiveUsers} inactive`) : undefined}
          href={`/${locale}/admin/users`}
        />
        <StatCard
          title={isTr ? "Roller" : "Roles"}
          value={String(roles?.length ?? 0)}
          hint={isTr ? `${systemRoles} sistem · ${customRoles} özel` : `${systemRoles} system · ${customRoles} custom`}
          href={`/${locale}/admin/roles`}
        />
        <StatCard
          title={isTr ? "Tenant Durumu" : "Tenant Status"}
          value={
            me?.tenant?.status === "trial"
              ? isTr ? "Deneme" : "Trial"
              : me?.tenant?.status === "active"
              ? isTr ? "Aktif" : "Active"
              : me?.tenant?.status === "suspended"
              ? isTr ? "Askıda" : "Suspended"
              : "—"
          }
          hint={me?.tenant?.slug ? `${me.tenant.slug}.localhost` : undefined}
        />
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
        {isTr
          ? "Sol menüden Kullanıcılar veya Roller sekmelerine geçerek yönetim yapabilirsin."
          : "Use the left menu to manage Users or Roles."}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  hint,
  href,
}: {
  title: string;
  value: string;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <div className="flex h-full flex-col glass-card p-5 text-card-foreground transition-colors hover:border-indigo-300 dark:hover:border-indigo-700">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
  return href ? <Link href={href} className="block">{inner}</Link> : inner;
}
