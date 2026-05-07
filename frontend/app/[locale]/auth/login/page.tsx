"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { API_BASE, login } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { inputClass, labelClass, linkBtnClass, submitBtnClass } from "@/components/auth/styles";


const OAUTH_ERROR_KEYS: Record<string, string> = {
  microsoft_not_configured: "microsoft_not_configured",
  not_registered: "microsoft_not_registered",
  personal_account_not_allowed: "microsoft_personal_blocked",
};


function LoginForm() {
  const t = useTranslations("auth");
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // OAuth callback'inden error paramı geldiyse uygun i18n mesajını göster
  useEffect(() => {
    const e = searchParams.get("error");
    if (!e) return;
    const key = OAUTH_ERROR_KEYS[e];
    if (key) setError(t(key));
    else setError(locale === "tr" ? "Giriş başarısız" : "Sign-in failed");
  }, [searchParams, t, locale]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await login({ email, password });
      setToken(res.data.access_token);
      router.push(`/${locale}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.detail || (locale === "tr" ? "Hata oluştu" : "An error occurred"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("login_title")}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("login_subtitle")}</p>
      </div>

      <div>
        <label className={labelClass} htmlFor="email">
          {t("email")}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          required
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className={labelClass} htmlFor="password">
            {t("password")}
          </label>
          <Link
            href={`/${locale}/auth/forgot-password`}
            className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {t("forgot_password")}
          </Link>
        </div>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          required
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button type="submit" disabled={loading} className={submitBtnClass}>
        {loading ? "..." : t("login_submit")}
      </button>

      <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
        {t("no_account")}{" "}
        <Link href={`/${locale}/signup`} className={linkBtnClass}>
          {t("create_account")}
        </Link>
      </p>

      {/* ── Divider ─────────────────────────────────────────────── */}
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-[11px] text-gray-400 dark:text-gray-500">
          <span className="bg-white dark:bg-gray-900 px-2">{t("or_continue_with")}</span>
        </div>
      </div>

      {/* ── Microsoft (corporate only) ──────────────────────────────
          Button olarak render — href server'da window.location bilemediği
          için lib/api.ts'in dinamik baseURL'i ile hydration mismatch
          yaratıyordu. Click handler'ı client-side'da çalışır. */}
      <button
        type="button"
        onClick={() => {
          window.location.href = `${API_BASE}/auth/microsoft?locale=${locale}`;
        }}
        className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/40"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path fill="#F25022" d="M1 1h10v10H1z" />
          <path fill="#00A4EF" d="M13 1h10v10H13z" />
          <path fill="#7FBA00" d="M1 13h10v10H1z" />
          <path fill="#FFB900" d="M13 13h10v10H13z" />
        </svg>
        {t("microsoft_login")}
      </button>
      <p className="mt-1 text-center text-[10px] text-gray-400 dark:text-gray-500">
        {t("microsoft_corporate_only")}
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <AuthLayout>
        <LoginForm />
      </AuthLayout>
    </Suspense>
  );
}
