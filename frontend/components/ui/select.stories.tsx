import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Label } from "./label";

const meta: Meta<typeof Select> = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <div className="grid w-64 gap-2">
      <Label>Ülke</Label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Seçim yap..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tr">Türkiye</SelectItem>
          <SelectItem value="de">Almanya</SelectItem>
          <SelectItem value="fr">Fransa</SelectItem>
          <SelectItem value="us">Amerika</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};
