"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConfirmDialogProps = {
  /** Modalın açık/kapalı durumu */
  open: boolean;
  /** Açık/kapalı değişikliği için handler */
  onOpenChange: (open: boolean) => void;
  /** Başlık */
  title: string;
  /** Açıklama */
  description?: string;
  /** Onay butonu metni (default: "Onayla") */
  confirmText?: string;
  /** İptal butonu metni (default: "Vazgeç") */
  cancelText?: string;
  /** Yıkıcı işlem için kırmızı buton (default: false) */
  destructive?: boolean;
  /** Onay handler — Promise döndürürse loading state gösterilir */
  onConfirm: () => void | Promise<unknown>;
};

/**
 * Yıkıcı veya geri alınamaz işlemler için onay modali.
 *
 * Örnek:
 * ```tsx
 * <ConfirmDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Hesabı sil"
 *   description="Bu işlem geri alınamaz."
 *   destructive
 *   onConfirm={async () => { await api.delete(...); }}
 * />
 * ```
 */
export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Onayla",
  cancelText = "Vazgeç",
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async (e: React.MouseEvent) => {
    const result = onConfirm();
    if (result instanceof Promise) {
      e.preventDefault();
      setLoading(true);
      try {
        await result;
        onOpenChange(false);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              destructive &&
                buttonVariants({ variant: "destructive" })
            )}
          >
            {loading ? "..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
