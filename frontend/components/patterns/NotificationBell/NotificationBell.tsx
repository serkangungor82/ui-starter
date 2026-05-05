"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type Notification = {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "danger" | string;
  read: boolean;
  created_at: string;
};

const typeAccent: Record<string, string> = {
  info: "border-l-sky-500",
  warning: "border-l-amber-500",
  danger: "border-l-red-500",
};

export type NotificationBellProps = {
  fetcher: () => Promise<Notification[]>;
  markRead: (id: number) => Promise<unknown>;
  markAllRead: () => Promise<unknown>;
  formatDate?: (iso: string) => string;
  emptyText?: string;
  title?: string;
  markAllText?: string;
};

/**
 * Backend agnostik bildirim çanı.
 *
 * Backend sözleşmesi:
 *   GET  /notifications/       -> Notification[]
 *   POST /notifications/{id}/read
 *   POST /notifications/read-all
 */
export default function NotificationBell({
  fetcher,
  markRead,
  markAllRead,
  formatDate = (iso) => new Date(iso).toLocaleDateString("tr-TR"),
  emptyText = "Bildirim yok",
  title = "Bildirimler",
  markAllText = "Tümünü okundu işaretle",
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    fetcher().then(setNotifications).catch(() => {});
  }, [fetcher]);

  const unread = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id: number) => {
    await markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAll = async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && unread > 0) handleMarkAll();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="relative" aria-label={title}>
            <Bell className="size-5" />
            {unread > 0 && (
              <Badge
                variant="default"
                className="absolute -right-1 -top-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]"
              >
                {unread > 9 ? "9+" : unread}
              </Badge>
            )}
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold">{title}</span>
          {unread > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="text-xs text-primary hover:underline"
            >
              {markAllText}
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <ScrollArea className="max-h-80">
            <div>
              {notifications.slice(0, 10).map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => !n.read && handleMarkRead(n.id)}
                  className={cn(
                    "block w-full border-l-4 px-4 py-3 text-left transition-colors hover:bg-accent",
                    typeAccent[n.type] ?? "border-l-border",
                    n.read && "opacity-60"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {n.message}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground">{formatDate(n.created_at)}</span>
                      {!n.read && <span className="size-2 rounded-full bg-primary" />}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
