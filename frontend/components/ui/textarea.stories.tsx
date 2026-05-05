import type { Meta, StoryObj } from "@storybook/nextjs";
import { Textarea } from "./textarea";
import { Label } from "./label";

const meta: Meta<typeof Textarea> = {
  title: "UI/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  render: () => (
    <div className="grid w-80 gap-2">
      <Label htmlFor="msg">Mesaj</Label>
      <Textarea id="msg" placeholder="Mesajınızı yazın..." />
    </div>
  ),
};
