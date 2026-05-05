"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";
import { listNotifications, markRead, markAllRead } from "@/lib/api";
import NotificationBell from "@/components/patterns/NotificationBell/NotificationBell";
import { ModeToggle } from "@/components/ui/mode-toggle";

function HomeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
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

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 1 0-16 0" />
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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    import("@/lib/api").then(({ getMe }) => {
      getMe()
        .then((r) => {
          setIsAdmin(r.data.is_admin);
        })
        .catch(() => {});
    });
  }, []);

  const logout = () => {
    removeToken();
    router.push(`/${locale}/auth/login`);
  };

  const links = [
    { href: `/${locale}/dashboard`, label: locale === "tr" ? "Kontrol Paneli" : "Dashboard", icon: <HomeIcon /> },
    { href: `/${locale}/dashboard/account`, label: locale === "tr" ? "Hesabım" : "My Account", icon: <UserIcon /> },
    { href: `/${locale}/dashboard/settings`, label: locale === "tr" ? "Ayarlar" : "Settings", icon: <SettingsIcon /> },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col bg-gradient-to-b from-indigo-700 to-violet-800">
        <div className="flex h-14 items-center justify-center border-b border-white/10 px-5">
          <span className="text-base font-bold text-white">UI Starter</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="flex flex-col gap-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active ? "bg-white/20 text-white" : "text-indigo-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className={active ? "text-white" : "text-indigo-300"}>{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
        <div className="border-t border-white/10 p-3 flex flex-col gap-1">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-indigo-200 hover:bg-red-500/30 hover:text-red-200 transition-colors"
          >
            <span className="text-indigo-300"><LogoutIcon /></span>
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center justify-end gap-3 border-b border-border bg-card px-6">
          {isAdmin && (
            <Link
              href={`/${locale}/admin`}
              className="flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-500/20 dark:text-indigo-300"
            >
              <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-[9px] font-bold text-white tracking-wide">ADMIN</span>
              Yönetim Paneli
            </Link>
          )}
          <NotificationBell
            fetcher={() => listNotifications().then((r) => r.data)}
            markRead={markRead}
            markAllRead={markAllRead}
          />
          <ModeToggle />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-hidden bg-muted/30 p-6 flex flex-col min-h-0">
          {children}
        </main>
      </div>

    </div>
  );
}
