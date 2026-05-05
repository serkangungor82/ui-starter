"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";
import { getMe } from "@/lib/api";
import { ModeToggle } from "@/components/ui/mode-toggle";

function GridIcon() {
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


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useParams<{ locale: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getMe().then((r) => {
      if (!r.data.is_admin) router.replace(`/${locale}/dashboard`);
      else setChecking(false);
    }).catch(() => router.replace(`/${locale}/auth/login`));
  }, [locale, router]);

  const logout = () => {
    removeToken();
    router.push(`/${locale}/auth/login`);
  };

  const links = [
    { href: `/${locale}/admin`, label: "Kontrol Paneli", icon: <GridIcon /> },
    { href: `/${locale}/admin/settings`, label: "Ayarlar", icon: <SettingsIcon /> },
  ];

  if (checking) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent dark:border-indigo-400 dark:border-t-transparent" />
    </div>
  );

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="flex w-56 flex-col bg-gradient-to-b from-indigo-700 to-violet-800">
        <div className="flex h-14 items-center justify-center border-b border-white/10 px-5 gap-2">
          <span className="text-base font-bold text-white">UI Starter</span>
          <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white">ADMIN</span>
        </div>
        <nav className="flex-1 p-3">
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
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-indigo-200 hover:bg-red-500/30 hover:text-red-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-300">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Çıkış Yap
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-end gap-3 border-b border-border bg-card px-6">
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-2 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-500/20 dark:text-indigo-300"
          >
            <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-[9px] font-bold text-white tracking-wide">USER</span>
            Kullanıcı Paneli
          </Link>
          <ModeToggle />
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/30 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
