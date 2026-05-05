import type { Meta, StoryObj } from "@storybook/nextjs";
import { Switch } from "./switch";
import { Label } from "./label";

const meta: Meta<typeof Switch> = {
  title: "UI/Switch",
  component: Switch,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Switch id="notif" />
      <Label htmlFor="notif" className="text-sm font-normal">E-posta bildirimleri</Label>
    </div>
  ),
};

export const On: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Switch id="dark" defaultChecked />
      <Label htmlFor="dark" className="text-sm font-normal">Koyu tema</Label>
    </div>
  ),
};
