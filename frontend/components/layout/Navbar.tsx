"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken, removeToken } from "@/lib/auth";
import { ModeToggle } from "@/components/ui/mode-toggle";

export default function Navbar() {
  const t = useTranslations("nav");
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!getToken());
  }, []);

  const logout = () => {
    removeToken();
    router.push(`/${locale}`);
  };

  const otherLocale = locale === "tr" ? "en" : "tr";
  const flags: Record<string, string> = { tr: "🇹🇷", en: "🇺🇸" };
  const labels: Record<string, string> = { tr: "TR", en: "EN" };

  return (
    <nav className="border-b border-white/10 bg-[#0a0f1e]">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-4">
        <Link href={`/${locale}`} className="text-xl font-bold text-white">
          UI Starter
        </Link>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Link href={`/${otherLocale}`} className="flex items-center gap-1 text-sm text-white/50 hover:text-white/80 transition-colors">
            <span>{flags[otherLocale]}</span>
            <span>{labels[otherLocale]}</span>
          </Link>
          {loggedIn ? (
            <>
              <Link href={`/${locale}/dashboard`} className="text-sm text-white/70 hover:text-white transition-colors">
                {t("dashboard")}
              </Link>
              <button onClick={logout} className="text-sm text-white/50 hover:text-red-400 transition-colors">
                {t("logout")}
              </button>
            </>
          ) : (
            <>
              <Link href={`/${locale}/auth/login`} className="text-sm text-white/70 hover:text-white transition-colors">
                {t("login")}
              </Link>
              <Link
                href={`/${locale}/auth/register`}
                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400 transition-colors"
              >
                {t("register")}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
