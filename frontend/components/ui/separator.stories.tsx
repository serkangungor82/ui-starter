import type { Meta, StoryObj } from "@storybook/nextjs";
import { Separator } from "./separator";

const meta: Meta<typeof Separator> = {
  title: "UI/Separator",
  component: Separator,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-72 space-y-2">
      <p className="text-sm font-medium">Hesap ayarları</p>
      <Separator />
      <p className="text-sm text-muted-foreground">Profil bilgilerini güncelle.</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-3 text-sm">
      <span>Login</span>
      <Separator orientation="vertical" />
      <span>Register</span>
    </div>
  ),
};
