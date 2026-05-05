import type { Meta, StoryObj } from "@storybook/nextjs";
import { ModeToggle } from "./mode-toggle";

const meta: Meta<typeof ModeToggle> = {
  title: "UI/ModeToggle",
  component: ModeToggle,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Light/Dark/System dropdown (next-themes). Bu story Storybook'un kendi tema toolbar'ından bağımsız çalışır — gerçek next-themes provider Storybook ortamında mount edilmediği için burada theme değişikliği görünmeyebilir.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ModeToggle>;

export const Default: Story = {
  render: () => <ModeToggle />,
};
