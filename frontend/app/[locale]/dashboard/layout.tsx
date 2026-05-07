"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { removeToken } from "@/lib/auth";
import { listNotifications, markRead, markAllRead, getMe, type UserMe } from "@/lib/api";
import NotificationBell from "@/components/patterns/NotificationBell/NotificationBell";
import { ModeToggle } from "@/components/ui/mode-toggle";

// ── Icons (lucide-style inline SVG) ────────────────────────────

function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function PackageIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="m3.27 6.96 8.73 5.05 8.73-5.05" />
      <path d="M12 22.08V12" />
    </svg>
  );
}
function CustomersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function FileTextIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
function ScrollIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
      <path d="M19 17V5a2 2 0 0 0-2-2H4" />
    </svg>
  );
}
function HeadphonesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a1 1 0 0 1-1-1v-6a9 9 0 0 1 18 0v6a1 1 0 0 1-1 1h-2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
  );
}
function CheckSquareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
function BarChartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}
function PlugIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2v6" />
      <path d="M15 2v6" />
      <path d="M6 8h12v3a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z" />
      <path d="M12 15v7" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useParams<{ locale: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<UserMe | null>(null);
  const isTr = locale === "tr";

  useEffect(() => {
    getMe()
      .then((r) => setMe(r.data))
      .catch(() => router.replace(`/${locale}/auth/login`));
  }, [locale, router]);

  const logout = () => {
    removeToken();
    router.push(`/${locale}/auth/login`);
  };

  const canAccessAdmin = !!me?.permissions?.includes("users.read");

  const links = [
    { href: `/${locale}/dashboard`, label: isTr ? "Kontrol Paneli" : "Dashboard", icon: <HomeIcon /> },
    { href: `/${locale}/dashboard/products`, label: isTr ? "Ürünler ve Hizmetler" : "Products & Services", icon: <PackageIcon /> },
    { href: `/${locale}/dashboard/customers`, label: isTr ? "Müşteriler" : "Customers", icon: <CustomersIcon /> },
    { href: `/${locale}/dashboard/quotes`, label: isTr ? "Teklifler" : "Quotes", icon: <FileTextIcon /> },
    { href: `/${locale}/dashboard/contracts`, label: isTr ? "Sözleşmeler" : "Contracts", icon: <ScrollIcon /> },
    { href: `/${locale}/dashboard/tickets`, label: isTr ? "Talepler" : "Tickets", icon: <HeadphonesIcon /> },
    { href: `/${locale}/dashboard/tasks`, label: isTr ? "Görevler" : "Tasks", icon: <CheckSquareIcon /> },
    { href: `/${locale}/dashboard/reports`, label: isTr ? "Raporlar" : "Reports", icon: <BarChartIcon /> },
    { href: `/${locale}/dashboard/integrations`, label: isTr ? "Entegrasyonlar" : "Integrations", icon: <PlugIcon /> },
    { href: `/${locale}/dashboard/account`, label: isTr ? "Hesabım" : "My Account", icon: <UserIcon /> },
    { href: `/${locale}/dashboard/settings`, label: isTr ? "Ayarlar" : "Settings", icon: <SettingsIcon /> },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="relative flex w-60 shrink-0 flex-col bg-gradient-to-b from-indigo-800 via-violet-900 to-purple-950 shadow-[inset_-1px_0_0_rgba(255,255,255,0.06)]">
        {/* Glass-y top highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />
        <div className="flex h-14 items-center justify-center border-b border-white/10 px-4">
          <span className="text-base font-bold text-white">UI Starter</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="flex flex-col gap-0.5">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    active
                      ? "bg-gradient-to-r from-white/25 via-white/15 to-transparent text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] ring-1 ring-white/10"
                      : "text-indigo-200/90 hover:bg-white/10 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  }`}
                >
                  <span className={active ? "text-white" : "text-indigo-300/90 group-hover:text-white/90"}>{link.icon}</span>
                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
        <UserCard me={me} />
      </aside>

      {/* Sub-sidebar — Ürünler ve Hizmetler altındaki ikincil ikon paneli */}
      {pathname?.startsWith(`/${locale}/dashboard/products`) && (
        <Suspense fallback={null}>
          <ProductsSubSidebar locale={locale} pathname={pathname} />
        </Suspense>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-end gap-3 border-b border-border bg-card px-6">
          {canAccessAdmin && (
            <Link
              href={`/${locale}/admin`}
              className="flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-500/20 dark:text-indigo-300"
            >
              <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-[9px] font-bold text-white tracking-wide">ADMIN</span>
              {isTr ? "Yönetim Paneli" : "Admin Panel"}
            </Link>
          )}
          <NotificationBell
            fetcher={() => listNotifications().then((r) => r.data)}
            markRead={markRead}
            markAllRead={markAllRead}
          />
          <ModeToggle />
          <button
            type="button"
            onClick={logout}
            aria-label={isTr ? "Çıkış Yap" : "Log out"}
            title={isTr ? "Çıkış Yap" : "Log out"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-600 dark:hover:bg-red-500/15 dark:hover:text-red-400"
          >
            <LogoutIcon />
          </button>
        </header>

        <main className="glass-mesh-bg flex flex-1 flex-col overflow-hidden bg-muted/30 p-6 min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * /dashboard/products altında ana sidebar'ın yanında açılan dar (w-16)
 * ikon panel. Tab tıklandığında ?type=... query parametresiyle ana
 * liste sayfasını filtreler. Yeni/Düzenleme sayfalarındayken aktif
 * sekme görünür kalır.
 */
function ProductsSubSidebar({ locale, pathname }: { locale: string; pathname: string }) {
  const searchParams = useSearchParams();
  const isTr = locale === "tr";
  const onListPage = pathname === `/${locale}/dashboard/products`;
  const activeType = onListPage ? searchParams.get("type") : null;

  const ListIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
  const BoxIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
  const ToolIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );

  const items: { key: string; tr: string; en: string; icon: React.ReactNode; href: string; matchType: string | null }[] = [
    { key: "all", tr: "Tümü", en: "All", icon: ListIcon, href: `/${locale}/dashboard/products`, matchType: null },
    { key: "products", tr: "Ürünler", en: "Products", icon: BoxIcon, href: `/${locale}/dashboard/products?type=product`, matchType: "product" },
    { key: "services", tr: "Hizmetler", en: "Services", icon: ToolIcon, href: `/${locale}/dashboard/products?type=service`, matchType: "service" },
  ];

  return (
    <aside className="relative hidden w-16 shrink-0 flex-col items-center bg-gradient-to-b from-indigo-950 via-violet-950 to-purple-950 shadow-[inset_1px_0_0_rgba(255,255,255,0.04),inset_-1px_0_0_rgba(0,0,0,0.4)] md:flex">
      {/* Glass top highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/8" />
      {/* Subtle backdrop noise — daha derin glass hissi için */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
      <div className="relative h-14 w-full shrink-0" />
      <nav className="relative w-full flex-1 p-3">
        <div className="flex flex-col items-center gap-1">
          {items.map((it) => {
            const label = isTr ? it.tr : it.en;
            const active = onListPage ? activeType === it.matchType : false;
            return (
              <Link
                key={it.key}
                href={it.href}
                aria-label={label}
                title={label}
                className={`group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                  active
                    ? "bg-gradient-to-br from-white/25 via-white/10 to-transparent text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 ring-white/10"
                    : "text-indigo-200/70 hover:bg-white/10 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                }`}
              >
                {it.icon}
                <span className="pointer-events-none invisible absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-white/10 bg-gray-900/95 px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-xl backdrop-blur-md transition-opacity duration-150 group-hover:visible group-hover:opacity-100">
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}


function UserCard({ me }: { me: UserMe | null }) {
  if (!me) return <div className="border-t border-white/10 p-3" />;
  const initials =
    ((me.first_name?.[0] ?? "") + (me.last_name?.[0] ?? "")).toUpperCase() ||
    me.email[0].toUpperCase();
  const displayName = `${me.first_name ?? ""} ${me.last_name ?? ""}`.trim() || me.email;
  return (
    <div className="border-t border-white/10 p-3">
      <div className="flex items-center gap-2 rounded-lg px-2 py-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-[11px] font-bold text-white">
          {initials}
        </div>
        <p className="truncate text-sm font-medium text-white">{displayName}</p>
      </div>
    </div>
  );
}
