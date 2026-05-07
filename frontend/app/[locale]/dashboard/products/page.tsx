"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  getMe,
  listProducts,
  deleteProduct,
  type UserMe,
  type ProductSummary,
  type ProductType,
} from "@/lib/api";


const TYPE_LABEL: Record<ProductType, { tr: string; en: string }> = {
  product: { tr: "Ürün", en: "Product" },
  service: { tr: "Hizmet", en: "Service" },
};

const TYPE_TONE: Record<ProductType, string> = {
  product: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  service: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
};


export default function ProductsListPage() {
  return (
    <Suspense>
      <ProductsListInner />
    </Suspense>
  );
}

function ProductsListInner() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTr = locale === "tr";

  // Filtre sub-sidebar'dan ?type= query parametresiyle gelir; pillerle değişince URL güncellenir.
  const queryType = searchParams.get("type");
  const filterType: ProductType | "all" =
    queryType === "product" ? "product" : queryType === "service" ? "service" : "all";

  const [me, setMe] = useState<UserMe | null>(null);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const setFilterType = (next: ProductType | "all") => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("type");
    else params.set("type", next);
    const qs = params.toString();
    router.push(`/${locale}/dashboard/products${qs ? `?${qs}` : ""}`);
  };

  const refresh = async () => {
    const [m, p] = await Promise.all([getMe(), listProducts()]);
    setMe(m.data);
    setProducts(p.data);
  };

  useEffect(() => {
    refresh().catch(() => {}).finally(() => setLoading(false));
  }, []);

  const canCreate = !!me?.permissions?.includes("products.create");
  const canUpdate = !!me?.permissions?.includes("products.update");
  const canDelete = !!me?.permissions?.includes("products.delete");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (filterType !== "all" && p.type !== filterType) return false;
      if (q && !`${p.name} ${p.sku ?? ""} ${p.barcode ?? ""}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [products, filterType, search]);

  const stats = useMemo(() => {
    const total = products.length;
    const productCount = products.filter((p) => p.type === "product").length;
    const serviceCount = total - productCount;
    const inactive = products.filter((p) => !p.is_active).length;
    return { total, productCount, serviceCount, inactive };
  }, [products]);

  const handleDelete = async (p: ProductSummary) => {
    const ok = window.confirm(
      isTr ? `"${p.name}" pasifleştirilsin mi? (kayıt korunur)` : `Deactivate "${p.name}"?`,
    );
    if (!ok) return;
    try {
      await deleteProduct(p.id);
      await refresh();
    } catch (e: any) {
      alert(e.response?.data?.detail || "Hata");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600 dark:border-indigo-500/30 dark:border-t-indigo-400" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5 overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{isTr ? "Ürünler ve Hizmetler" : "Products & Services"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isTr ? "Sattığın ürün ve hizmet kataloğu." : "Your product and service catalog."}
          </p>
        </div>
        {canCreate && (
          <Link
            href={`/${locale}/dashboard/products/new`}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            + {isTr ? "Yeni Kayıt" : "New Item"}
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatBox label={isTr ? "Toplam" : "Total"} value={stats.total} />
        <StatBox label={isTr ? "Ürün" : "Product"} value={stats.productCount} tone="indigo" />
        <StatBox label={isTr ? "Hizmet" : "Service"} value={stats.serviceCount} tone="emerald" />
        <StatBox label={isTr ? "Pasif" : "Inactive"} value={stats.inactive} tone="amber" />
      </div>

      {/* Search — tip filtresi sol sub-sidebar'dan yapılır */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {filterType === "product"
            ? isTr ? "Yalnızca ürünler gösteriliyor" : "Showing products only"
            : filterType === "service"
            ? isTr ? "Yalnızca hizmetler gösteriliyor" : "Showing services only"
            : isTr ? "Tüm kayıtlar" : "All records"}
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={isTr ? "Ad, SKU, barkod ara..." : "Search name, SKU, barcode..."}
          className="ml-auto w-full max-w-sm rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
        />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto glass-card">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 border-b border-border bg-muted/50 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur">
            <tr>
              <th className="px-4 py-3 text-left">{isTr ? "Tip" : "Type"}</th>
              <th className="px-4 py-3 text-left">{isTr ? "Ad" : "Name"}</th>
              <th className="px-4 py-3 text-left">SKU / {isTr ? "Barkod" : "Barcode"}</th>
              <th className="px-4 py-3 text-right">{isTr ? "Fiyat" : "Price"}</th>
              <th className="px-4 py-3 text-right">{isTr ? "Stok" : "Stock"}</th>
              <th className="px-4 py-3 text-left">{isTr ? "Durum" : "Status"}</th>
              <th className="px-4 py-3 text-right">{isTr ? "İşlem" : "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TYPE_TONE[p.type]}`}>
                    {TYPE_LABEL[p.type][isTr ? "tr" : "en"]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/${locale}/dashboard/products/${p.id}/edit`}
                    className="font-medium hover:underline"
                  >
                    {p.name}
                  </Link>
                  {p.short_description && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{p.short_description}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  <p className="font-mono">{p.sku || "—"}</p>
                  {p.barcode && <p className="font-mono">{p.barcode}</p>}
                </td>
                <td className="px-4 py-3 text-right">
                  {p.price ? (
                    <span className="font-medium">
                      {Number(p.price).toLocaleString(isTr ? "tr-TR" : "en-US", { minimumFractionDigits: 2 })}{" "}
                      <span className="text-xs text-muted-foreground">{p.currency}</span>
                    </span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {p.type === "service" ? (
                    <span className="text-xs text-muted-foreground">—</span>
                  ) : p.stock_quantity !== null ? (
                    <span
                      className={
                        p.min_stock && Number(p.stock_quantity) <= Number(p.min_stock)
                          ? "font-medium text-amber-600 dark:text-amber-400"
                          : "font-medium"
                      }
                    >
                      {Number(p.stock_quantity).toLocaleString(isTr ? "tr-TR" : "en-US")}
                      {p.unit && <span className="ml-1 text-xs text-muted-foreground">{p.unit}</span>}
                    </span>
                  ) : "—"}
                </td>
                <td className="px-4 py-3">
                  {p.is_active ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                      {isTr ? "Aktif" : "Active"}
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                      {isTr ? "Pasif" : "Inactive"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    {canUpdate && (
                      <Link
                        href={`/${locale}/dashboard/products/${p.id}/edit`}
                        className="rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted/40"
                      >
                        {isTr ? "Düzenle" : "Edit"}
                      </Link>
                    )}
                    {canDelete && p.is_active && (
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-950/30"
                      >
                        {isTr ? "Sil" : "Delete"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  {isTr ? "Kayıt yok. Yeni bir ürün veya hizmet ekleyin." : "No records. Add a new product or service."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function StatBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "indigo" | "emerald" | "amber";
}) {
  const accent =
    tone === "indigo"
      ? "from-indigo-500 to-violet-600"
      : tone === "emerald"
      ? "from-emerald-500 to-teal-600"
      : tone === "amber"
      ? "from-amber-500 to-orange-600"
      : "from-slate-500 to-slate-700";
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${accent} opacity-10 blur-2xl`} />
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

