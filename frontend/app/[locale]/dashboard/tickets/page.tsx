"use client";

import { useParams } from "next/navigation";
import { ComingSoon } from "@/components/dashboard/ComingSoon";

export default function TicketsPage() {
  const { locale } = useParams<{ locale: string }>();
  const isTr = locale === "tr";
  return (
    <ComingSoon
      title={isTr ? "Talepler" : "Tickets"}
      description={
        isTr
          ? "Müşteri talepleri ve destek ticket'ları — atama, durum, öncelik takibi."
          : "Customer requests and support tickets — assignment, status, priority tracking."
      }
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a1 1 0 0 1-1-1v-6a9 9 0 0 1 18 0v6a1 1 0 0 1-1 1h-2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
        </svg>
      }
    />
  );
}
