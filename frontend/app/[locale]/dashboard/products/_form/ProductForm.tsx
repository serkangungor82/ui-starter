"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  createProduct,
  updateProduct,
  type ProductInput,
  type ProductSummary,
  type ProductType,
  type ProductFeature,
} from "@/lib/api";


type Tab = "general" | "pricing" | "content" | "seo";

interface FormState {
  type: ProductType;
  name: string;
  sku: string;
  barcode: string;
  qr_code: string;
  short_description: string;
  long_description: string;
  features: ProductFeature[];
  price: string;
  currency: string;
  vat_rate: string;
  unit: string;
  stock_quantity: string;
  min_stock: string;
  seo_title: string;
  seo_description: string;
  seo_slug: string;
  is_active: boolean;
}

function blank(): FormState {
  return {
    type: "product",
    name: "",
    sku: "",
    barcode: "",
    qr_code: "",
    short_description: "",
    long_description: "",
    features: [],
    price: "",
    currency: "TRY",
    vat_rate: "20",
    unit: "adet",
    stock_quantity: "",
    min_stock: "",
    seo_title: "",
    seo_description: "",
    seo_slug: "",
    is_active: true,
  };
}

function fromProduct(p: ProductSummary): FormState {
  return {
    type: p.type,
    name: p.name ?? "",
    sku: p.sku ?? "",
    barcode: p.barcode ?? "",
    qr_code: p.qr_code ?? "",
    short_description: p.short_description ?? "",
    long_description: p.long_description ?? "",
    features: p.features ?? [],
    price: p.price ?? "",
    currency: p.currency ?? "TRY",
    vat_rate: p.vat_rate ?? "",
    unit: p.unit ?? "",
    stock_quantity: p.stock_quantity ?? "",
    min_stock: p.min_stock ?? "",
    seo_title: p.seo_title ?? "",
    seo_description: p.seo_description ?? "",
    seo_slug: p.seo_slug ?? "",
    is_active: p.is_active,
  };
}


export function ProductForm({ initial }: { initial?: ProductSummary }) {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const isTr = locale === "tr";
  const isEdit = !!initial;

  const [tab, setTab] = useState<Tab>("general");
  const [form, setForm] = useState<FormState>(initial ? fromProduct(initial) : blank());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Yeni kayıt: ad değiştikçe slug otomatik öner (kullanıcı override edebilir)
  useEffect(() => {
    if (isEdit) return;
    if (form.seo_slug) return;
    const slug = form.name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
      .replace(/ş/g, "s").replace(/ç/g, "c").replace(/ğ/g, "g")
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
    if (slug) setForm((f) => ({ ...f, seo_slug: slug }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name, isEdit]);

  const isService = form.type === "service";

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const addFeature = () =>
    setForm((f) => ({ ...f, features: [...f.features, { name: "", value: "" }] }));
  const removeFeature = (i: number) =>
    setForm((f) => ({ ...f, features: f.features.filter((_, idx) => idx !== i) }));
  const updateFeature = (i: number, key: "name" | "value", v: string) =>
    setForm((f) => ({
      ...f,
      features: f.features.map((feat, idx) => (idx === i ? { ...feat, [key]: v } : feat)),
    }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload: ProductInput = {
        type: form.type,
        name: form.name.trim(),
        sku: form.sku.trim() || null,
        barcode: form.barcode.trim() || null,
        qr_code: form.qr_code.trim() || null,
        short_description: form.short_description.trim() || null,
        long_description: form.long_description.trim() || null,
        features: form.features.filter((f) => f.name.trim() && f.value.trim()),
        price: form.price.trim() || null,
        currency: form.currency.trim() || "TRY",
        vat_rate: form.vat_rate.trim() || null,
        unit: form.unit.trim() || null,
        stock_quantity: isService ? null : form.stock_quantity.trim() || null,
        min_stock: isService ? null : form.min_stock.trim() || null,
        seo_title: form.seo_title.trim() || null,
        seo_description: form.seo_description.trim() || null,
        seo_slug: form.seo_slug.trim() || null,
        is_active: form.is_active,
      };
      if (isEdit && initial) {
        await updateProduct(initial.id, payload);
      } else {
        await createProduct(payload);
      }
      router.push(`/${locale}/dashboard/products`);
    } catch (e: any) {
      const detail = e.response?.data?.detail;
      setError(typeof detail === "string" ? detail : Array.isArray(detail) ? detail[0]?.msg ?? "Hata" : "Hata");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col gap-5 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`/${locale}/dashboard/products`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <span aria-hidden>←</span>
            {isTr ? "Ürünler ve Hizmetler" : "Products & Services"}
          </Link>
          <h1 className="mt-1 text-2xl font-bold">
            {isEdit
              ? isTr ? `Düzenle: ${initial?.name}` : `Edit: ${initial?.name}`
              : isTr ? "Yeni Ürün/Hizmet" : "New Product/Service"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => update("is_active", e.target.checked)}
            />
            <span>{isTr ? "Aktif" : "Active"}</span>
          </label>
          <button
            type="button"
            onClick={() => router.push(`/${locale}/dashboard/products`)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted/40"
          >
            {isTr ? "Vazgeç" : "Cancel"}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {submitting ? "..." : isTr ? "Kaydet" : "Save"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <TabBtn active={tab === "general"} onClick={() => setTab("general")}>
          {isTr ? "Genel" : "General"}
        </TabBtn>
        <TabBtn active={tab === "pricing"} onClick={() => setTab("pricing")}>
          {isTr ? "Fiyat ve Stok" : "Pricing & Stock"}
        </TabBtn>
        <TabBtn active={tab === "content"} onClick={() => setTab("content")}>
          {isTr ? "İçerik ve Özellikler" : "Content & Features"}
        </TabBtn>
        <TabBtn active={tab === "seo"} onClick={() => setTab("seo")}>
          SEO
        </TabBtn>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto pb-4">
        {tab === "general" && (
          <div className="space-y-4">
            <Field label={isTr ? "Tip" : "Type"}>
              <div className="flex gap-2">
                <TypeBtn active={form.type === "product"} onClick={() => update("type", "product")}>
                  {isTr ? "Ürün" : "Product"}
                </TypeBtn>
                <TypeBtn active={form.type === "service"} onClick={() => update("type", "service")}>
                  {isTr ? "Hizmet" : "Service"}
                </TypeBtn>
              </div>
            </Field>
            <Field label={isTr ? "Ad" : "Name"} required>
              <Input value={form.name} onChange={(v) => update("name", v)} required />
            </Field>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="SKU / Stok Kodu">
                <Input value={form.sku} onChange={(v) => update("sku", v)} placeholder="ÜRN-001" />
              </Field>
              <Field label={isTr ? "Barkod (EAN/UPC)" : "Barcode (EAN/UPC)"}>
                <Input value={form.barcode} onChange={(v) => update("barcode", v)} placeholder="8690000000001" />
              </Field>
              <Field label={isTr ? "Karekod (QR)" : "QR Code"}>
                <Input value={form.qr_code} onChange={(v) => update("qr_code", v)} placeholder="https://..." />
              </Field>
            </div>
            <Field label={isTr ? "Kısa Açıklama" : "Short description"}>
              <Input
                value={form.short_description}
                onChange={(v) => update("short_description", v)}
                placeholder={isTr ? "Liste ve önizlemelerde görünür (max 500)" : "Shows in lists/previews (max 500)"}
              />
            </Field>
          </div>
        )}

        {tab === "pricing" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label={isTr ? "Birim Fiyat" : "Unit price"}>
                <Input type="number" step="0.01" value={form.price} onChange={(v) => update("price", v)} placeholder="0.00" />
              </Field>
              <Field label={isTr ? "Para Birimi" : "Currency"}>
                <select
                  value={form.currency}
                  onChange={(e) => update("currency", e.target.value)}
                  className={inputCls}
                >
                  <option value="TRY">TRY (₺)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </Field>
              <Field label={isTr ? "KDV (%)" : "VAT (%)"}>
                <Input type="number" step="0.01" value={form.vat_rate} onChange={(v) => update("vat_rate", v)} placeholder="20" />
              </Field>
            </div>
            <Field label={isTr ? "Birim" : "Unit"}>
              <Input
                value={form.unit}
                onChange={(v) => update("unit", v)}
                placeholder={isTr ? "adet, kg, lt, saat..." : "pcs, kg, lt, hour..."}
              />
            </Field>
            {!isService && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label={isTr ? "Stok Miktarı" : "Stock quantity"}>
                  <Input type="number" step="0.001" value={form.stock_quantity} onChange={(v) => update("stock_quantity", v)} placeholder="0" />
                </Field>
                <Field label={isTr ? "Kritik Stok Seviyesi" : "Min stock"}>
                  <Input type="number" step="0.001" value={form.min_stock} onChange={(v) => update("min_stock", v)} placeholder="0" />
                </Field>
              </div>
            )}
            {isService && (
              <p className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                {isTr ? "Hizmet kayıtlarında stok takibi yapılmaz." : "Stock is not tracked for services."}
              </p>
            )}
          </div>
        )}

        {tab === "content" && (
          <div className="space-y-4">
            <Field label={isTr ? "Detaylı Açıklama" : "Long description"}>
              <textarea
                rows={8}
                value={form.long_description}
                onChange={(e) => update("long_description", e.target.value)}
                className={`${inputCls} font-mono`}
                placeholder={isTr ? "Markdown destekler (* listeler, ** kalın **, [link](...))" : "Markdown supported"}
              />
            </Field>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  {isTr ? "Özellikler (Anahtar / Değer)" : "Features (Key / Value)"}
                </label>
                <button
                  type="button"
                  onClick={addFeature}
                  className="rounded-md border border-border px-2 py-1 text-xs font-medium hover:bg-muted/40"
                >
                  + {isTr ? "Özellik Ekle" : "Add Feature"}
                </button>
              </div>
              {form.features.length === 0 && (
                <p className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                  {isTr ? "Henüz özellik yok. \"Renk: Siyah\" gibi anahtar/değer çiftleri ekleyebilirsin." : "No features yet."}
                </p>
              )}
              <div className="space-y-2">
                {form.features.map((f, i) => (
                  <div key={i} className="flex items-stretch gap-2">
                    <input
                      type="text"
                      value={f.name}
                      onChange={(e) => updateFeature(i, "name", e.target.value)}
                      placeholder={isTr ? "Anahtar (örn. Renk)" : "Key (e.g. Color)"}
                      className={`${inputCls} flex-1`}
                    />
                    <input
                      type="text"
                      value={f.value}
                      onChange={(e) => updateFeature(i, "value", e.target.value)}
                      placeholder={isTr ? "Değer (örn. Siyah)" : "Value (e.g. Black)"}
                      className={`${inputCls} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={() => removeFeature(i)}
                      className="shrink-0 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-950/30"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "seo" && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              {isTr
                ? "Bu alanlar arama motorları ve paylaşım önizlemeleri için kullanılır."
                : "Used by search engines and share previews."}
            </p>
            <Field label={isTr ? "SEO Başlık" : "SEO title"} hint={`${form.seo_title.length}/60 ${isTr ? "ideal" : "ideal"}`}>
              <Input value={form.seo_title} onChange={(v) => update("seo_title", v)} placeholder={form.name} />
            </Field>
            <Field label={isTr ? "SEO Açıklama" : "SEO description"} hint={`${form.seo_description.length}/160 ${isTr ? "ideal" : "ideal"}`}>
              <textarea
                rows={3}
                value={form.seo_description}
                onChange={(e) => update("seo_description", e.target.value)}
                className={inputCls}
                placeholder={form.short_description}
              />
            </Field>
            <Field label={isTr ? "URL Slug" : "URL slug"} hint={isTr ? "küçük harf, rakam, tire" : "lowercase, digits, dashes"}>
              <Input value={form.seo_slug} onChange={(v) => update("seo_slug", v)} placeholder={isTr ? "urun-adi" : "product-name"} />
            </Field>
          </div>
        )}
      </div>
    </form>
  );
}


// ── Reusable bits ───────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900";


function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  type,
  step,
  placeholder,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  step?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type ?? "text"}
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className={inputCls}
    />
  );
}

function TabBtn({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px rounded-t-lg border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? "border-indigo-500 text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function TypeBtn({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
        active
          ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300"
          : "border-border bg-card text-muted-foreground hover:bg-muted/40"
      }`}
    >
      {children}
    </button>
  );
}
