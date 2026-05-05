import type { Meta, StoryObj } from "@storybook/nextjs";
import CommandPalette from "./CommandPalette";

const meta: Meta<typeof CommandPalette> = {
  title: "Patterns/CommandPalette",
  component: CommandPalette,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Cmd+K (Mac) / Ctrl+K (Win) bas. Storybook iframe'i içinde de tetiklenir. Default'lar i18n locale'ine bağlı navigasyon + tema komutlarıdır.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CommandPalette>;

export const Default: Story = {
  render: () => (
    <div className="text-center space-y-2">
      <p className="text-sm text-muted-foreground">
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
          ⌘K
        </kbd>{" "}
        veya{" "}
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">
          Ctrl+K
        </kbd>{" "}
        ile aç
      </p>
      <CommandPalette />
    </div>
  ),
};
