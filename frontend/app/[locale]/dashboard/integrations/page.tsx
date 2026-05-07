"use client";

import { useParams } from "next/navigation";
import { ComingSoon } from "@/components/dashboard/ComingSoon";

export default function IntegrationsPage() {
  const { locale } = useParams<{ locale: string }>();
  const isTr = locale === "tr";
  return (
    <ComingSoon
      title={isTr ? "Entegrasyonlar" : "Integrations"}
      description={
        isTr
          ? "E-posta (SMTP), SMS, takvim, muhasebe ve diğer üçüncü taraf servisler."
          : "Email (SMTP), SMS, calendar, accounting and other third-party services."
      }
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 2v6" />
          <path d="M15 2v6" />
          <path d="M6 8h12v3a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z" />
          <path d="M12 15v7" />
        </svg>
      }
    />
  );
}
