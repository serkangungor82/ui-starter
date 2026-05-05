import type { Meta, StoryObj } from "@storybook/nextjs";
import { Calendar, Settings, User } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command";

const meta: Meta<typeof Command> = {
  title: "UI/Command",
  component: Command,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Command>;

export const Default: Story = {
  render: () => (
    <Command className="w-80 rounded-xl border border-border">
      <CommandInput placeholder="Komut ara..." />
      <CommandList>
        <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
        <CommandGroup heading="Öneriler">
          <CommandItem>
            <Calendar className="size-4" />
            Takvim
            <CommandShortcut>⌘C</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <User className="size-4" />
            Profil
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Ayarlar">
          <CommandItem>
            <Settings className="size-4" />
            Tercihler
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};
