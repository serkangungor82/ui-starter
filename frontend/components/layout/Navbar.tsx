"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { getToken, removeToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export default function Navbar() {
  const t = useTranslations("nav");
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

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

  const closeSheet = () => setSheetOpen(false);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
        <Link
          href={`/${locale}`}
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          UI Starter
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          <ModeToggle />
          <Link
            href={`/${otherLocale}`}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span aria-hidden>{flags[otherLocale]}</span>
            <span>{labels[otherLocale]}</span>
          </Link>
          <Separator orientation="vertical" className="h-5 mx-1" />
          {loggedIn ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href={`/${locale}/dashboard`}>{t("dashboard")}</Link>}
              />
              <Button onClick={logout} variant="ghost" size="sm">
                {t("logout")}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href={`/${locale}/auth/login`}>{t("login")}</Link>}
              />
              <Button
                size="sm"
                render={<Link href={`/${locale}/auth/register`}>{t("register")}</Link>}
              />
            </>
          )}
        </div>

        {/* Mobile nav */}
        <div className="flex md:hidden items-center gap-1">
          <ModeToggle />
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open menu">
                  <Menu className="size-5" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>UI Starter</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-4 pb-4">
                <Link
                  href={`/${otherLocale}`}
                  onClick={closeSheet}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <span aria-hidden>{flags[otherLocale]}</span>
                  <span>{labels[otherLocale]}</span>
                </Link>
                <Separator className="my-2" />
                {loggedIn ? (
                  <>
                    <Link
                      href={`/${locale}/dashboard`}
                      onClick={closeSheet}
                      className="rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      {t("dashboard")}
                    </Link>
                    <button
                      onClick={() => {
                        closeSheet();
                        logout();
                      }}
                      className="text-left rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      {t("logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/${locale}/auth/login`}
                      onClick={closeSheet}
                      className="rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      {t("login")}
                    </Link>
                    <Link
                      href={`/${locale}/auth/register`}
                      onClick={closeSheet}
                      className="mt-1 rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      {t("register")}
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
