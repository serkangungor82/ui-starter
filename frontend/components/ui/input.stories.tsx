import type { Meta, StoryObj } from "@storybook/nextjs";
import { Input } from "./input";
import { Label } from "./label";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: "name@example.com", type: "email" },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-72 gap-2">
      <Label htmlFor="email">E-posta</Label>
      <Input id="email" type="email" placeholder="name@example.com" />
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: "Düzenlenemez" },
};

export const Invalid: Story = {
  render: () => (
    <div className="grid w-72 gap-1.5">
      <Label htmlFor="invalid">Telefon</Label>
      <Input id="invalid" aria-invalid placeholder="+90..." defaultValue="abc" />
      <p className="text-xs text-destructive">Geçerli bir telefon numarası girin.</p>
    </div>
  ),
};
