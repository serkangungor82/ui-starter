"use client";

export default function AdminSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ayarlar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Admin panel ayarları</p>
      </div>
      <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-card py-24 text-card-foreground">
        <p className="text-sm text-muted-foreground">Henüz içerik yok</p>
      </div>
    </div>
  );
}
