import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof ConfirmDialog> = {
  title: "Patterns/ConfirmDialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Sürdür
        </Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Devam etmek istiyor musun?"
          description="Mevcut taslak kaybolacak."
          onConfirm={() => alert("Onaylandı")}
        />
      </>
    );
  },
};

export const Destructive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Hesabı sil
        </Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Hesabı kalıcı olarak silmek istiyor musun?"
          description="Bu işlem geri alınamaz. Tüm verilerin silinecek."
          confirmText="Evet, sil"
          cancelText="Vazgeç"
          destructive
          onConfirm={async () => {
            await new Promise((r) => setTimeout(r, 800));
          }}
        />
      </>
    );
  },
};
