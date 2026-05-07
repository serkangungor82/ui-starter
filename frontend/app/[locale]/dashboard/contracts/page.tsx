"use client";

import { useParams } from "next/navigation";
import { ComingSoon } from "@/components/dashboard/ComingSoon";

export default function ContractsPage() {
  const { locale } = useParams<{ locale: string }>();
  const isTr = locale === "tr";
  return (
    <ComingSoon
      title={isTr ? "Sözleşmeler" : "Contracts"}
      description={
        isTr
          ? "Aktif ve süresi dolmuş sözleşmeler — başlangıç/bitiş tarihleri, yenileme uyarıları."
          : "Active and expired contracts — start/end dates, renewal alerts."
      }
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
          <path d="M19 17V5a2 2 0 0 0-2-2H4" />
        </svg>
      }
    />
  );
}
