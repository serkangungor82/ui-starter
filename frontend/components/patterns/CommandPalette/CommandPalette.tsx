"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Moon,
  Settings,
  Sun,
  SunMoon,
  UserPlus,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { getToken, removeToken } from "@/lib/auth";

export type CommandPaletteCommand = {
  id: string;
  label: string;
  group?: string;
  icon?: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  onSelect: () => void;
};

export type CommandPaletteProps = {
  /** Custom command'ler — defaults'a ek olarak eklenir */
  extraCommands?: CommandPaletteCommand[];
  /** Default command'leri devre dışı bırak */
  disableDefaults?: boolean;
};

/**
 * Cmd+K (Mac) / Ctrl+K (Win/Linux) ile açılan command palette.
 *
 * Default'lar:
 * - Anasayfa, Dashboard, Login/Logout, Register, Settings (i18n route'ları)
 * - Light / Dark / System tema
 *
 * Root layout veya locale layout içinde global olarak mount edilmesi tavsiye edilir.
 */
export default function CommandPalette({
  extraCommands = [],
  disableDefaults = false,
}: CommandPaletteProps = {}) {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale ?? "tr";

  useEffect(() => {
    setLoggedIn(!!getToken());
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const run = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  const navCommands: CommandPaletteCommand[] = disableDefaults
    ? []
    : [
        {
          id: "nav-home",
          label: "Anasayfa",
          group: "Navigasyon",
          icon: Home,
          onSelect: () => router.push(`/${locale}`),
        },
        ...(loggedIn
          ? [
              {
                id: "nav-dashboard",
                label: "Dashboard",
                group: "Navigasyon",
                icon: LayoutDashboard,
                onSelect: () => router.push(`/${locale}/dashboard`),
              },
              {
                id: "nav-settings",
                label: "Ayarlar",
                group: "Navigasyon",
                icon: Settings,
                onSelect: () => router.push(`/${locale}/dashboard/settings`),
              },
              {
                id: "auth-logout",
                label: "Çıkış yap",
                group: "Hesap",
                icon: LogOut,
                onSelect: () => {
                  removeToken();
                  router.push(`/${locale}`);
                },
              },
            ]
          : [
              {
                id: "auth-login",
                label: "Giriş yap",
                group: "Hesap",
                icon: LogIn,
                onSelect: () => router.push(`/${locale}/auth/login`),
              },
              {
                id: "auth-register",
                label: "Kayıt ol",
                group: "Hesap",
                icon: UserPlus,
                onSelect: () => router.push(`/${locale}/auth/register`),
              },
            ]),
      ];

  const themeCommands: CommandPaletteCommand[] = disableDefaults
    ? []
    : [
        {
          id: "theme-light",
          label: "Açık tema",
          group: "Tema",
          icon: Sun,
          onSelect: () => setTheme("light"),
        },
        {
          id: "theme-dark",
          label: "Koyu tema",
          group: "Tema",
          icon: Moon,
          onSelect: () => setTheme("dark"),
        },
        {
          id: "theme-system",
          label: "Sistem teması",
          group: "Tema",
          icon: SunMoon,
          onSelect: () => setTheme("system"),
        },
      ];

  const allCommands = [...navCommands, ...themeCommands, ...extraCommands];
  const groups = Array.from(
    allCommands.reduce((acc, cmd) => {
      const key = cmd.group ?? "Diğer";
      if (!acc.has(key)) acc.set(key, []);
      acc.get(key)!.push(cmd);
      return acc;
    }, new Map<string, CommandPaletteCommand[]>())
  );

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Komut ara..." />
      <CommandList>
        <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
        {groups.map(([group, commands], idx) => (
          <div key={group}>
            {idx > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {commands.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <CommandItem key={cmd.id} onSelect={run(cmd.onSelect)}>
                    {Icon && <Icon className="size-4" />}
                    <span>{cmd.label}</span>
                    {cmd.shortcut && <CommandShortcut>{cmd.shortcut}</CommandShortcut>}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
