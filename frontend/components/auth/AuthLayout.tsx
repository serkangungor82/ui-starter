"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

/**
 * Auth sayfaları için ortak split-screen layout (Partner Portal stili).
 * Sol: koyu marka paneli (3 gradient blob + pitch).
 * Sağ: children (form, max-w-md) — formun üstünde "← Anasayfa" linki.
 *
 * Breakpoint: md (768px+). Altında tek kolon, sol panel kompakt biçimde
 * formun üstünde görünür.
 */
export function AuthLayout({
  children,
  hideHomeLink = false,
}: {
  children: React.ReactNode;
  hideHomeLink?: boolean;
}) {
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations("auth");
  const isTr = locale === "tr";
  const otherLocale = locale === "tr" ? "en" : "tr";
  const flags: Record<string, string> = { tr: "🇹🇷", en: "🇺🇸" };

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[5fr_7fr]">
      {/* ── LEFT — brand panel ──────────────────────────────────── */}
      <aside className="relative isolate overflow-hidden bg-[#0a0f1e] text-white md:flex md:flex-col md:justify-between">
        {/* Gradient blobs */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-indigo-700/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-violet-700/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-indigo-600/25 blur-3xl" />

        {/* Top: brand — anasayfaya geri dönüş */}
        <div className="relative px-8 pt-8 md:px-10 md:pt-10 lg:px-12 lg:pt-12">
          <Link
            href={`/${locale}`}
            aria-label={t("back_to_home")}
            className="inline-flex items-center gap-2.5 transition hover:opacity-80"
          >
            <span className="text-xl font-black tracking-tight text-white">UI Starter</span>
            <span className="mt-1.5 border-l border-white/15 pl-2.5 text-xs font-normal uppercase tracking-wider leading-none text-white/55">
              {isTr ? "Yönetim Paneli" : "Admin Panel"}
            </span>
          </Link>
        </div>

        {/* Middle: pitch — md ve üstünde */}
        <div className="relative hidden px-10 md:block lg:px-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
            {isTr ? "B2B SaaS Şablonu" : "B2B SaaS Template"}
          </span>
          <h1 className="mt-6 max-w-2xl bg-gradient-to-br from-white via-white to-indigo-300 bg-clip-text text-3xl font-black leading-tight tracking-tight text-transparent lg:text-4xl">
            {isTr
              ? "Multi-tenant SaaS için hazır iskelet"
              : "A ready-made skeleton for multi-tenant SaaS"}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-400">
            {isTr
              ? "Subdomain bazlı tenant izolasyonu, RBAC, self-service signup ve modern auth UI'larıyla yeni B2B SaaS projenize dakikalar içinde başlayın. Her tenant kendi alt domain'inde, kendi kullanıcı/rol kümesiyle bağımsız çalışır."
              : "Start a new B2B SaaS project in minutes — subdomain-based tenant isolation, RBAC, self-service signup and a modern auth UI included. Each tenant runs independently on its own subdomain with its own users and roles."}
          </p>
        </div>

        {/* Mobile: kompakt pitch — küçük ekran */}
        <div className="relative px-8 py-6 md:hidden">
          <p className="text-sm text-slate-400">
            {isTr
              ? "Müşteri ilişkilerinin merkezi tek panelde."
              : "Your customer relationships, in one panel."}
          </p>
        </div>

        {/* Bottom: locale + footer */}
        <div className="relative flex items-center justify-between border-t border-white/10 px-8 py-5 text-xs text-white/40 md:px-10 md:py-6 lg:px-12">
          <span>© {new Date().getFullYear()} UI Starter</span>
          <Link
            href={`/${otherLocale}`}
            className="flex items-center gap-1.5 text-white/60 transition hover:text-white"
          >
            <span>{flags[otherLocale]}</span>
            <span className="font-medium">{otherLocale.toUpperCase()}</span>
          </Link>
        </div>
      </aside>

      {/* ── RIGHT — form panel ──────────────────────────────────── */}
      <main className="flex items-center justify-center bg-white dark:bg-gray-900 px-6 py-10 md:px-10 lg:px-12">
        <div className="w-full max-w-md">
          {!hideHomeLink && (
            <Link
              href={`/${locale}`}
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <span aria-hidden>←</span>
              {t("back_to_home")}
            </Link>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
