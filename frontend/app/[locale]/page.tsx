"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const { locale } = useParams<{ locale: string }>();
  const isTr = locale === "tr";

  return (
    <div className="flex-1 bg-background text-foreground">
      <section className="relative overflow-hidden bg-zinc-950 px-4 pb-32 pt-24 text-zinc-50 dark:bg-zinc-950">
        <div className="pointer-events-none absolute -left-32 -top-32 size-96 rounded-full bg-indigo-700/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-0 size-96 rounded-full bg-violet-700/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-indigo-500" />
            </span>
            UI Starter
          </span>

          <h1 className="mt-8 bg-gradient-to-br from-zinc-50 via-zinc-50 to-indigo-300 bg-clip-text pb-2 text-5xl font-black leading-[1.15] tracking-tight text-transparent md:text-6xl">
            {isTr ? "Yeni projenize hızlı başlangıç" : "Kickstart your next project"}
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-zinc-400">
            {isTr
              ? "Auth, dashboard, admin paneli, i18n ve modern UI bileşenleriyle hazır bir Next.js iskeleti."
              : "A ready-made Next.js skeleton with auth, dashboard, admin panel, i18n and modern UI components."}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-11 px-7 text-base"
              render={
                <Link href={`/${locale}/auth/register`}>
                  {isTr ? "Hemen Başla" : "Get Started"}
                  <ArrowRight className="size-4" />
                </Link>
              }
            />
            <Button
              variant="outline"
              size="lg"
              className="h-11 border-zinc-700 bg-zinc-900/40 px-7 text-base text-zinc-100 hover:bg-zinc-800 hover:text-zinc-50"
              render={<Link href={`/${locale}/auth/login`}>{isTr ? "Giriş Yap" : "Sign In"}</Link>}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
