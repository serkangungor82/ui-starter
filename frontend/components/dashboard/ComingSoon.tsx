"use client";

import { useParams } from "next/navigation";

/**
 * Henüz gerçek implementasyonu olmayan dashboard sayfaları için
 * ortak "Yakında" yer tutucu.
 */
export function ComingSoon({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  const { locale } = useParams<{ locale: string }>();
  const isTr = locale === "tr";
  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-card p-12 shadow-sm">
        <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative max-w-md text-center">
          {icon && (
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
              {icon}
            </div>
          )}
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
            {isTr ? "Yakında" : "Coming soon"}
          </span>
          <h2 className="mt-4 text-xl font-bold text-foreground">
            {isTr ? "Bu modül üzerinde çalışıyoruz" : "This module is in progress"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isTr
              ? "Menü iskeleti hazır; gerçek özellikler ve veri yönetimi sıradaki güncellemelerde geliyor."
              : "Menu is ready; actual features and data management are coming in upcoming updates."}
          </p>
        </div>
      </div>
    </div>
  );
}
