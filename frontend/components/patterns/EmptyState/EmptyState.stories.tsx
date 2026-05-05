import type { Meta, StoryObj } from "@storybook/nextjs";
import { Inbox, Search } from "lucide-react";
import EmptyState from "./EmptyState";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof EmptyState> = {
  title: "Patterns/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const NoNotifications: Story = {
  args: {
    icon: Inbox,
    title: "Henüz bildiriminiz yok",
    description: "Yeni bildirimleriniz burada görünecek. Şimdilik sakin tutalım.",
    className: "w-96",
  },
};

export const NoSearchResults: Story = {
  args: {
    icon: Search,
    title: "Arama sonucu bulunamadı",
    description: "Farklı anahtar kelimeler dene veya filtreleri kaldır.",
    action: <Button variant="outline">Filtreleri sıfırla</Button>,
    className: "w-96",
  },
};

export const Minimal: Story = {
  args: {
    title: "Boş",
    className: "w-72",
  },
};
