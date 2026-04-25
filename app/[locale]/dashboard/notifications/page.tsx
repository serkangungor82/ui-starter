"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { listNotifications, markRead, markAllRead } from "@/lib/api";

const typeColors: Record<string, string> = {
  info: "border-l-blue-400",
  warning: "border-l-orange-400",
  danger: "border-l-red-500",
};

export default function NotificationsPage() {
  const t = useTranslations("dashboard");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listNotifications().then((r) => setNotifications(r.data)).finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id: number) => {
    await markRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (loading) return <div className="text-gray-400">Yükleniyor...</div>;

  const unread = notifications.filter((n) => !n.read);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("notifications")}</h1>
        {unread.length > 0 && (
          <button onClick={handleMarkAllRead} className="text-sm text-indigo-600 hover:underline">
            Tümünü okundu işaretle
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-400">
          Bildirim yok
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.read && handleMarkRead(n.id)}
              className={`rounded-xl border-l-4 bg-white p-4 shadow-sm cursor-pointer transition-opacity ${typeColors[n.type]} ${n.read ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs text-gray-400">
                    {new Date(n.created_at).toLocaleDateString("tr-TR")}
                  </span>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-indigo-600" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
