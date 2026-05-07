"use client";

import { useParams } from "next/navigation";
import { ComingSoon } from "@/components/dashboard/ComingSoon";

export default function TasksPage() {
  const { locale } = useParams<{ locale: string }>();
  const isTr = locale === "tr";
  return (
    <ComingSoon
      title={isTr ? "Görevler" : "Tasks"}
      description={
        isTr
          ? "Takım görevleri — atama, son tarih, müşteri/teklif/sözleşmeye bağlama."
          : "Team tasks — assignment, due dates, link to customer/quote/contract."
      }
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      }
    />
  );
}
