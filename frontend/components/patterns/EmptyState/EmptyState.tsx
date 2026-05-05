import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type EmptyStateProps = {
  /** Görsel ikon bileşeni (lucide ikonu vs.) */
  icon?: ComponentType<{ className?: string }>;
  /** Ana başlık */
  title: string;
  /** Açıklama metni */
  description?: string;
  /** İsteğe bağlı CTA — buton vs. component'i */
  action?: ReactNode;
  /** Ekstra class */
  className?: string;
};

/**
 * Boş durumlar için sade, içerik-öncelikli görünüm.
 *
 * Örnek kullanım:
 * ```tsx
 * <EmptyState
 *   icon={Inbox}
 *   title="Hiç bildiriminiz yok"
 *   description="Bildirimleriniz burada görünecek"
 *   action={<Button>Yenile</Button>}
 * />
 * ```
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center",
        className
      )}
    >
      {Icon && (
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Icon className="size-6" />
        </div>
      )}
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
