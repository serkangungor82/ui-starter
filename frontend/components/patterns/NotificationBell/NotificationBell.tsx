"use client";

import { useEffect, useRef, useState } from "react";

export type Notification = {
  id: number;
  title: string;
  message: string;
  type: "info" | "warning" | "danger" | string;
  read: boolean;
  created_at: string;
};

const typeColors: Record<string, string> = {
  info: "border-l-blue-400",
  warning: "border-l-orange-400",
  danger: "border-l-red-500",
};

function BellIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export type NotificationBellProps = {
  /** Bildirimleri getirir. Genelde axios çağrısı: () => api.get("/notifications/").then(r => r.data) */
  fetcher: () => Promise<Notification[]>;
  /** Tek bir bildirimi okundu işaretler. */
  markRead: (id: number) => Promise<unknown>;
  /** Tümünü okundu işaretler. */
  markAllRead: () => Promise<unknown>;
  /** Tarih biçimleyici. Default: tr-TR. */
  formatDate?: (iso: string) => string;
  /** "Bildirim yok" boş hali metni. */
  emptyText?: string;
  /** Üst bar başlığı. */
  title?: string;
  /** "Tümünü okundu işaretle" butonu metni. */
  markAllText?: string;
};

/**
 * Backend agnostik bildirim çanı.
 * - Açıldığında okunmamışları otomatik tümünü-okundu yapar (sıfırlama davranışı için
 *   açar açmaz `markAllRead()` çağırır; istemiyorsan davranışı değiştir).
 * - Listede tıklanan tek bir bildirimi de okundu yapar.
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
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetcher().then(setNotifications).catch(() => {});
  }, [fetcher]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id: number) => {
    await markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAll = async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          const opening = !open;
          setOpen(opening);
          if (opening && unread > 0) handleMarkAll();
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        aria-label={title}
      >
        <BellIcon />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <span className="text-sm font-semibold">{title}</span>
            {unread > 0 && (
              <button onClick={handleMarkAll} className="text-xs text-indigo-600 hover:underline">
                {markAllText}
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-400">{emptyText}</p>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                  className={`border-l-4 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${typeColors[n.type] ?? "border-l-gray-200"} ${n.read ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs text-gray-400">{formatDate(n.created_at)}</span>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-indigo-600" />}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
