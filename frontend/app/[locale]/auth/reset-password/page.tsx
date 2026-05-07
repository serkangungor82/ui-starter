"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

import { resetPassword } from "@/lib/api";
import { AuthLayout } from "@/components/auth/AuthLayout";
import {
  PasswordStrength,
  isPasswordValid,
} from "@/components/auth/PasswordStrength";
import {
  inputClass,
  labelClass,
  submitBtnClass,
} from "@/components/auth/styles";


function ResetForm() {
  const t = useTranslations("auth");
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phone, setPhone] = useState<string | undefined>(
    searchParams.get("phone") ?? undefined
  );
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const defaultCountry = locale === "en" ? "US" : "TR";
  const passwordValid = isPasswordValid(password);
  const passwordsMatch = password.length > 0 && password === confirm;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !isValidPhoneNumber(phone)) {
      setError(locale === "tr" ? "Geçerli bir GSM numarası girin" : "Enter a valid phone number");
      return;
    }
    if (!passwordValid) {
      setError(locale === "tr" ? "Şifre kuralları sağlanmıyor" : "Password rules not met");
      return;
    }
    if (!passwordsMatch) {
      setError(t("passwords_no_match"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      await resetPassword({ phone, code, password });
      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || (locale === "tr" ? "Kod hatalı veya süresi dolmuş" : "Invalid or expired code"));
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("reset_title")}</h2>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
          ✓ {t("reset_success")}
        </div>
        <button
          type="button"
          onClick={() => router.push(`/${locale}/auth/login`)}
          className={submitBtnClass}
        >
          {t("login_title")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("reset_title")}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("reset_desc")}</p>
      </div>

      <div>
        <label className={labelClass}>{t("phone")}</label>
        <PhoneInput
          international
          defaultCountry={defaultCountry as any}
          value={phone}
          onChange={setPhone}
          className="phone-input"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="code">
          {t("reset_code")}
        </label>
        <input
          id="code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className={`${inputClass} text-center font-mono text-lg tracking-[0.4em]`}
          placeholder="••••••"
          required
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="password">
          {t("reset_new_password")}
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          required
        />
        <PasswordStrength password={password} />
      </div>

      <div>
        <label className={labelClass} htmlFor="confirm">
          {t("confirm_password")}
        </label>
        <input
          id="confirm"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={`${inputClass} ${
            confirm && !passwordsMatch ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""
          }`}
          required
        />
        {confirm && !passwordsMatch && (
          <p className="mt-1 text-xs text-red-500">{t("passwords_no_match")}</p>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading || !passwordValid || !passwordsMatch || code.length !== 6}
        className={submitBtnClass}
      >
        {loading ? "..." : t("reset_submit")}
      </button>

      <Link
        href={`/${locale}/auth/login`}
        className="text-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      >
        ← {t("back_to_login")}
      </Link>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <AuthLayout hideHomeLink>
        <ResetForm />
      </AuthLayout>
    </Suspense>
  );
}
