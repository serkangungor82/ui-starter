"use client";

import { useParams } from "next/navigation";
import { ComingSoon } from "@/components/dashboard/ComingSoon";

export default function CustomersPage() {
  const { locale } = useParams<{ locale: string }>();
  const isTr = locale === "tr";
  return (
    <ComingSoon
      title={isTr ? "Müşteriler" : "Customers"}
      description={
        isTr
          ? "Şirket ve bireysel müşterilerin — iletişim bilgileri, notlar, etkileşim geçmişi."
          : "Your company and individual customers — contacts, notes, interaction history."
      }
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      }
    />
  );
}
