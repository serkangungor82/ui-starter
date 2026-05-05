import type { Meta, StoryObj } from "@storybook/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

const meta: Meta<typeof Avatar> = {
  title: "UI/Avatar",
  component: Avatar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/serkangungor82.png" alt="serkan" />
      <AvatarFallback>SG</AvatarFallback>
    </Avatar>
  ),
};

export const FallbackOnly: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>AY</AvatarFallback>
    </Avatar>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-3">
      <Avatar className="size-6"><AvatarFallback className="text-[10px]">XS</AvatarFallback></Avatar>
      <Avatar className="size-8"><AvatarFallback>SM</AvatarFallback></Avatar>
      <Avatar className="size-10"><AvatarFallback>MD</AvatarFallback></Avatar>
      <Avatar className="size-14"><AvatarFallback>LG</AvatarFallback></Avatar>
    </div>
  ),
};
