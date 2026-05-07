"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProduct, type ProductSummary } from "@/lib/api";
import { ProductForm } from "../../_form/ProductForm";


export default function EditProductPage() {
  const { locale, id } = useParams<{ locale: string; id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ProductSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getProduct(Number(id))
      .then((r) => setProduct(r.data))
      .catch(() => router.replace(`/${locale}/dashboard/products`))
      .finally(() => setLoading(false));
  }, [id, locale, router]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600 dark:border-indigo-500/30 dark:border-t-indigo-400" />
      </div>
    );
  }
  if (!product) return null;
  return <ProductForm initial={product} />;
}
