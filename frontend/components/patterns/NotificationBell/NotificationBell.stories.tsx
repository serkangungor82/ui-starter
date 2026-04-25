import type { Meta, StoryObj } from "@storybook/react";
import NotificationBell, { Notification } from "./NotificationBell";

const sampleNotifications: Notification[] = [
  {
    id: 1,
    title: "Hoş geldin!",
    message: "Hesabın başarıyla oluşturuldu.",
    type: "info",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 2,
    title: "Şifren değişti",
    message: "Az önce şifren güncellendi. Sen değilsen lütfen destek ile iletişime geç.",
    type: "warning",
    read: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 3,
    title: "Yeni özellik",
    message: "Profil sayfana fotoğraf ekleyebilirsin.",
    type: "info",
    read: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
];

const meta = {
  title: "Patterns/NotificationBell",
  component: NotificationBell,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof NotificationBell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    fetcher: async () => sampleNotifications,
    markRead: async () => {},
    markAllRead: async () => {},
  },
};

export const Empty: Story = {
  args: {
    fetcher: async () => [],
    markRead: async () => {},
    markAllRead: async () => {},
  },
};

export const ManyUnread: Story = {
  args: {
    fetcher: async () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        title: `Bildirim ${i + 1}`,
        message: "Örnek bildirim mesajı.",
        type: "info" as const,
        read: false,
        created_at: new Date().toISOString(),
      })),
    markRead: async () => {},
    markAllRead: async () => {},
  },
};
