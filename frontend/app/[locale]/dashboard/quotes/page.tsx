"use client";

import { useParams } from "next/navigation";
import { ComingSoon } from "@/components/dashboard/ComingSoon";

export default function QuotesPage() {
  const { locale } = useParams<{ locale: string }>();
  const isTr = locale === "tr";
  return (
    <ComingSoon
      title={isTr ? "Teklifler" : "Quotes"}
      description={
        isTr
          ? "Müşterilere gönderilen teklifler — ürün/hizmet, miktar, indirim, geçerlilik."
          : "Quotes sent to customers — products/services, quantities, discounts, validity."
      }
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      }
    />
  );
}
