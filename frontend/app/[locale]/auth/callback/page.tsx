"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { setToken } from "@/lib/auth";
import { getMe } from "@/lib/api";

export default function OAuthCallbackPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setToken(token);
      getMe().then((r) => {
        if (!r.data.phone) {
          router.replace(`/${locale}/auth/phone`);
        } else {
          router.replace(`/${locale}/dashboard`);
        }
      }).catch(() => router.replace(`/${locale}/dashboard`));
    } else {
      router.replace(`/${locale}/auth/login`);
    }
  }, [locale, router, searchParams]);

  return (
    <div className="flex flex-1 items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent dark:border-indigo-400 dark:border-t-transparent" />
        <p className="text-sm text-muted-foreground">Giriş yapılıyor...</p>
      </div>
    </div>
  );
}
