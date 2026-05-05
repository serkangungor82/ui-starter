import type { Meta, StoryObj } from "@storybook/nextjs";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

const meta: Meta<typeof Popover> = {
  title: "UI/Popover",
  component: Popover,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const QuickEdit: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline">Boyut ayarla</Button>} />
      <PopoverContent className="w-72 space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="w">Genişlik</Label>
          <Input id="w" defaultValue="320px" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="h">Yükseklik</Label>
          <Input id="h" defaultValue="240px" />
        </div>
      </PopoverContent>
    </Popover>
  ),
};
