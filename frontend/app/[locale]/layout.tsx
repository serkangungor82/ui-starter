import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { LocaleSync } from "@/components/locale-sync";
import CommandPalette from "@/components/patterns/CommandPalette/CommandPalette";
import NavbarSlot from "@/components/layout/NavbarSlot";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!["tr", "en"].includes(locale)) notFound();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <LocaleSync />
      <CommandPalette />
      <NavbarSlot />
      {children}
    </NextIntlClientProvider>
  );
}
