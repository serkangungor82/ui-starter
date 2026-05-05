import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

const meta: Meta<typeof Dialog> = {
  title: "UI/Dialog",
  component: Dialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Profili düzenle</Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Profili düzenle</DialogTitle>
              <DialogDescription>
                Bilgilerini güncelle. Kaydet&apos;e basınca değişiklikler uygulanır.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Ad</Label>
                <Input id="name" defaultValue="Serkan" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="username">Kullanıcı adı</Label>
                <Input id="username" defaultValue="@serkangungor82" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Vazgeç</Button>
              <Button onClick={() => setOpen(false)}>Kaydet</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  },
};
