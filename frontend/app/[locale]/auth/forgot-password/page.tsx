"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

import { forgotPassword } from "@/lib/api";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { labelClass, submitBtnClass } from "@/components/auth/styles";


function ForgotForm() {
  const t = useTranslations("auth");
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const [phone, setPhone] = useState<string | undefined>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const defaultCountry = locale === "en" ? "US" : "TR";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !isValidPhoneNumber(phone)) {
      setError(locale === "tr" ? "Geçerli bir GSM numarası girin" : "Enter a valid phone number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await forgotPassword(phone);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || (locale === "tr" ? "Hata oluştu" : "An error occurred"));
    } finally {
      setLoading(false);
    }
  };

  if (sent && phone) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("forgot_sent_title")}</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("forgot_sent_desc")}</p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
          ✓ <span className="font-mono">{phone}</span>
        </div>
        <button
          type="button"
          onClick={() =>
            router.push(`/${locale}/auth/reset-password?phone=${encodeURIComponent(phone)}`)
          }
          className={submitBtnClass}
        >
          {t("forgot_sent_continue")}
        </button>
        <Link
          href={`/${locale}/auth/login`}
          className="text-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ← {t("back_to_login")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("forgot_title")}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("forgot_desc")}</p>
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

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button type="submit" disabled={loading} className={submitBtnClass}>
        {loading ? "..." : t("forgot_submit")}
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

export default function ForgotPasswordPage() {
  return (
    <AuthLayout hideHomeLink>
      <ForgotForm />
    </AuthLayout>
  );
}
