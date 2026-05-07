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

      {/* Sub-sidebar — pathname'a göre menünün submenu'sü açılır.
          Her ana menü için ayrı submenu listesi (SUBMENUS map). */}
      <Suspense fallback={null}>
        <DynamicSubSidebar locale={locale} pathname={pathname ?? ""} />
      </Suspense>

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

// ── Submenu icons (lucide-style) ───────────────────────────────

const SubIcons = {
  list: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
  box: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>,
  tool: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>,
  user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 1 0-16 0" /></svg>,
  building: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /></svg>,
  trendUp: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
  star: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  draft: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  send: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>,
  check: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  x: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  clock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  alert: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
  refresh: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>,
  calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
  chartPie: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>,
  chartBar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>,
  wallet: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>,
  api: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
  hook: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  mail: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
  phone: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
  puzzle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.5 2.5 0 1 0-3.214 3.214c.446.166.855.498.925.968a.99.99 0 0 1-.276.837l-1.61 1.61a2.41 2.41 0 0 1-3.41 0l-1.568-1.568a1 1 0 0 0-.878-.29c-.493.074-.84.504-1.012.972a2.5 2.5 0 1 1-3.237-3.237c.469-.172.898-.52.972-1.012a1 1 0 0 0-.29-.878l-1.567-1.568A2.41 2.41 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77a1 1 0 0 1 .835-.275c.493.074.84.504 1.012.972a2.5 2.5 0 1 0 3.237-3.237c-.469-.172-.898-.52-.972-1.012a1 1 0 0 1 .275-.835l1.611-1.611a2.41 2.41 0 0 1 3.41 0l1.568 1.568c.23.23.556.338.878.29.493-.074.84-.504 1.012-.972a2.5 2.5 0 1 1 3.237 3.237c-.469.172-.898.52-.972 1.012Z" /></svg>,
  shield: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  palette: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" /><circle cx="17.5" cy="10.5" r=".5" /><circle cx="8.5" cy="7.5" r=".5" /><circle cx="6.5" cy="12.5" r=".5" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></svg>,
  database: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14a9 3 0 0 0 18 0V5" /><path d="M3 12a9 3 0 0 0 18 0" /></svg>,
  info: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>,
} as const;

type SubItem = { key: string; tr: string; en: string; icon: React.ReactNode };

/**
 * Her ana menü için submenü item'ları. `key` URL'de ?sub=key olarak görünür.
 * Submenü'sü olmayan menüler (Kontrol Paneli) buraya konmaz.
 */
const SUBMENUS: Record<string, SubItem[]> = {
  products: [
    { key: "all", tr: "Tümü", en: "All", icon: SubIcons.list },
    { key: "products", tr: "Ürünler", en: "Products", icon: SubIcons.box },
    { key: "services", tr: "Hizmetler", en: "Services", icon: SubIcons.tool },
  ],
  customers: [
    { key: "all", tr: "Tümü", en: "All", icon: SubIcons.list },
    { key: "individuals", tr: "Bireysel", en: "Individuals", icon: SubIcons.user },
    { key: "corporate", tr: "Kurumsal", en: "Corporate", icon: SubIcons.building },
    { key: "leads", tr: "Potansiyeller", en: "Leads", icon: SubIcons.trendUp },
    { key: "favorites", tr: "Favoriler", en: "Favorites", icon: SubIcons.star },
  ],
  quotes: [
    { key: "all", tr: "Tümü", en: "All", icon: SubIcons.list },
    { key: "draft", tr: "Taslak", en: "Draft", icon: SubIcons.draft },
    { key: "sent", tr: "Gönderilen", en: "Sent", icon: SubIcons.send },
    { key: "accepted", tr: "Kabul", en: "Accepted", icon: SubIcons.check },
    { key: "rejected", tr: "Reddedilen", en: "Rejected", icon: SubIcons.x },
    { key: "expired", tr: "Süresi Dolmuş", en: "Expired", icon: SubIcons.clock },
  ],
  contracts: [
    { key: "all", tr: "Tümü", en: "All", icon: SubIcons.list },
    { key: "active", tr: "Aktif", en: "Active", icon: SubIcons.check },
    { key: "expiring", tr: "Süresi Doluyor", en: "Expiring", icon: SubIcons.alert },
    { key: "expired", tr: "Süresi Dolmuş", en: "Expired", icon: SubIcons.clock },
    { key: "renewed", tr: "Yenilenen", en: "Renewed", icon: SubIcons.refresh },
  ],
  tickets: [
    { key: "all", tr: "Tümü", en: "All", icon: SubIcons.list },
    { key: "open", tr: "Açık", en: "Open", icon: SubIcons.alert },
    { key: "pending", tr: "Bekleyen", en: "Pending", icon: SubIcons.clock },
    { key: "resolved", tr: "Çözümlenen", en: "Resolved", icon: SubIcons.check },
    { key: "closed", tr: "Kapalı", en: "Closed", icon: SubIcons.x },
  ],
  tasks: [
    { key: "all", tr: "Tümü", en: "All", icon: SubIcons.list },
    { key: "mine", tr: "Bana Atanan", en: "Assigned to me", icon: SubIcons.user },
    { key: "today", tr: "Bugün", en: "Today", icon: SubIcons.calendar },
    { key: "overdue", tr: "Geciken", en: "Overdue", icon: SubIcons.alert },
    { key: "done", tr: "Tamamlanan", en: "Done", icon: SubIcons.check },
  ],
  reports: [
    { key: "sales", tr: "Satış", en: "Sales", icon: SubIcons.chartBar },
    { key: "customers", tr: "Müşteri", en: "Customers", icon: SubIcons.user },
    { key: "performance", tr: "Performans", en: "Performance", icon: SubIcons.trendUp },
    { key: "financial", tr: "Finansal", en: "Financial", icon: SubIcons.wallet },
    { key: "custom", tr: "Özel", en: "Custom", icon: SubIcons.chartPie },
  ],
  integrations: [
    { key: "api", tr: "API", en: "API", icon: SubIcons.api },
    { key: "webhooks", tr: "Webhook", en: "Webhook", icon: SubIcons.hook },
    { key: "email", tr: "E-posta", en: "Email", icon: SubIcons.mail },
    { key: "sms", tr: "SMS", en: "SMS", icon: SubIcons.phone },
    { key: "addons", tr: "Eklentiler", en: "Add-ons", icon: SubIcons.puzzle },
  ],
  account: [
    { key: "profile", tr: "Profil", en: "Profile", icon: SubIcons.user },
    { key: "security", tr: "Güvenlik", en: "Security", icon: SubIcons.shield },
    { key: "notifications", tr: "Bildirimler", en: "Notifications", icon: SubIcons.bell },
    { key: "activity", tr: "Aktivite Geçmişi", en: "Activity", icon: SubIcons.clock },
  ],
  settings: [
    { key: "general", tr: "Genel", en: "General", icon: SubIcons.info },
    { key: "appearance", tr: "Görünüm", en: "Appearance", icon: SubIcons.palette },
    { key: "company", tr: "Şirket", en: "Company", icon: SubIcons.building },
    { key: "notifications", tr: "Bildirimler", en: "Notifications", icon: SubIcons.bell },
    { key: "data", tr: "Veriler", en: "Data", icon: SubIcons.database },
    { key: "about", tr: "Hakkında", en: "About", icon: SubIcons.info },
  ],
};


/**
 * Pathname'a göre uygun submenü'yü gösterir. Path eşleşmediği menü için
 * (örn /dashboard) hiçbir submenu gösterilmez. Submenü item'ları
 * ?sub=<key> query parametresi ile linklenir; sayfa içinde bu param
 * okunup içerik filtrelenebilir.
 */
function DynamicSubSidebar({ locale, pathname }: { locale: string; pathname: string }) {
  const searchParams = useSearchParams();
  const isTr = locale === "tr";

  // Pathname'dan menü segment'ini çek: /tr/dashboard/<segment>/...
  const dashPrefix = `/${locale}/dashboard`;
  if (!pathname.startsWith(dashPrefix)) return null;
  const rest = pathname.slice(dashPrefix.length).replace(/^\//, "");
  const segment = rest.split("/")[0];

  const items = SUBMENUS[segment];
  if (!items) return null;

  // Products için özel uyumluluk: ?type= → ?sub= mapping
  // (mevcut /dashboard/products?type=product linkleriyle geriye dönük uyumlu)
  const queryType = searchParams.get("type");
  const querySub = searchParams.get("sub");
  let activeKey: string | null = querySub;
  if (segment === "products" && !querySub) {
    if (queryType === "product") activeKey = "products";
    else if (queryType === "service") activeKey = "services";
    else activeKey = "all";
  }
  // Diğer menülerde sub yoksa ilk item ("Tümü") implicit aktif sayılır
  if (!activeKey && items[0]?.key === "all") activeKey = "all";

  return (
    <aside className="relative hidden w-16 shrink-0 flex-col items-center bg-gradient-to-b from-indigo-950 via-violet-950 to-purple-950 shadow-[inset_1px_0_0_rgba(255,255,255,0.04),inset_-1px_0_0_rgba(0,0,0,0.4)] md:flex">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/8" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
      <div className="relative h-14 w-full shrink-0" />
      <nav className="relative w-full flex-1 p-3">
        <div className="flex flex-col items-center gap-1">
          {items.map((it) => {
            const label = isTr ? it.tr : it.en;
            const active = activeKey === it.key;
            // Products için ?type= URL'i koru (geriye dönük), diğerleri ?sub=
            let href: string;
            if (segment === "products") {
              if (it.key === "all") href = `${dashPrefix}/products`;
              else if (it.key === "products") href = `${dashPrefix}/products?type=product`;
              else href = `${dashPrefix}/products?type=service`;
            } else {
              href = it.key === "all"
                ? `${dashPrefix}/${segment}`
                : `${dashPrefix}/${segment}?sub=${it.key}`;
            }
            return (
              <Link
                key={it.key}
                href={href}
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
