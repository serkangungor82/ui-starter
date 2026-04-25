"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function LandingPage() {
  const { locale } = useParams<{ locale: string }>();
  const isTr = locale === "tr";

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      <section className="relative overflow-hidden bg-[#0a0f1e] px-4 pb-32 pt-24 text-white">
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-700/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-violet-700/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            UI Starter
          </span>

          <h1 className="mt-8 bg-gradient-to-br from-white via-white to-indigo-300 bg-clip-text pb-2 text-5xl font-black leading-[1.25] tracking-tight text-transparent md:text-6xl">
            {isTr ? "Yeni projenize hızlı başlangıç" : "Kickstart your next project"}
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-slate-400">
            {isTr
              ? "Auth, dashboard, admin paneli, i18n ve modern UI bileşenleriyle hazır bir Next.js iskeleti."
              : "A ready-made Next.js skeleton with auth, dashboard, admin panel, i18n and modern UI components."}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/${locale}/auth/register`}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-700/40 transition hover:bg-indigo-500"
            >
              {isTr ? "Hemen Başla" : "Get Started"}
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href={`/${locale}/auth/login`}
              className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white/80 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              {isTr ? "Giriş Yap" : "Sign In"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
