import type { Meta, StoryObj } from "@storybook/nextjs";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import { Button } from "./button";

const meta: Meta<typeof Tooltip> = {
  title: "UI/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <TooltipProvider delay={150}>
        <Story />
      </TooltipProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size="icon" aria-label="Info"><Info className="size-4" /></Button>} />
      <TooltipContent>Bu alan görünür değildir, sadece yöneticilere açıktır.</TooltipContent>
    </Tooltip>
  ),
};
