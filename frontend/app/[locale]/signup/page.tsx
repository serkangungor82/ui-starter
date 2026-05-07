"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

import { signup } from "@/lib/api";
import { AuthLayout } from "@/components/auth/AuthLayout";
import {
  PasswordStrength,
  isPasswordValid,
} from "@/components/auth/PasswordStrength";
import {
  inputClass,
  labelClass,
  linkBtnClass,
  submitBtnClass,
  verifyBtnClass,
} from "@/components/auth/styles";


function SignupForm() {
  const t = useTranslations("auth");
  const { locale } = useParams<{ locale: string }>();

  const [tenantName, setTenantName] = useState("");
  const [slug, setSlug] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState<string | undefined>();
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  const defaultCountry = locale === "en" ? "US" : "TR";
  const passwordValid = isPasswordValid(password);
  const passwordsMatch = password === confirm && confirm.length > 0;

  // Şirket adı yazıldıkça slug'ı otomatik öner (kullanıcı override edebilir)
  const suggestedSlug = useMemo(() => {
    return tenantName
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 63);
  }, [tenantName]);

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
    const finalSlug = (slug || suggestedSlug).trim().toLowerCase();
    if (!finalSlug) {
      setError(locale === "tr" ? "Alt domain zorunludur" : "Subdomain is required");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await signup({
        tenant_name: tenantName,
        slug: finalSlug,
        owner_email: email,
        owner_password: password,
        owner_first_name: firstName,
        owner_last_name: lastName,
        owner_phone: phone,
      });
      setCreatedSlug(res.data.tenant.slug);

      // 1.5sn sonra tenant subdomain'ine yönlendir
      const port = window.location.port ? `:${window.location.port}` : "";
      const target = `${window.location.protocol}//${res.data.tenant.slug}.localhost${port}/${locale}/auth/login`;
      setTimeout(() => {
        window.location.href = target;
      }, 1500);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") {
        setError(detail);
      } else if (Array.isArray(detail) && detail[0]?.msg) {
        setError(detail[0].msg);
      } else {
        setError(locale === "tr" ? "Hata oluştu" : "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  if (createdSlug) {
    const port = typeof window !== "undefined" && window.location.port ? `:${window.location.port}` : "";
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t("signup_success_title")}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("signup_success_desc")}
          </p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
          ✓ <span className="font-mono">{createdSlug}.localhost{port}</span>
        </div>
        <a
          href={`${typeof window !== "undefined" ? window.location.protocol : "http:"}//${createdSlug}.localhost${port}/${locale}/auth/login`}
          className={`${submitBtnClass} text-center`}
        >
          {t("go_to_panel")}
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("signup_title")}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("signup_subtitle")}</p>
      </div>

      <div>
        <label className={labelClass} htmlFor="tenant_name">
          {t("tenant_name")}{" "}
          <span className="font-normal text-gray-400 dark:text-gray-500">
            ({t("tenant_name_hint")})
          </span>
        </label>
        <input
          id="tenant_name"
          type="text"
          value={tenantName}
          onChange={(e) => setTenantName(e.target.value)}
          className={inputClass}
          required
          minLength={2}
          maxLength={255}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="slug">
          {t("slug")}
        </label>
        <div className="flex items-stretch overflow-hidden rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900">
          <input
            id="slug"
            type="text"
            value={slug || suggestedSlug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={t("slug_placeholder")}
            className="flex-1 bg-transparent px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none"
            pattern="[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?"
            required
          />
          <span className="flex items-center bg-gray-100 dark:bg-gray-700/40 px-3 text-xs font-mono text-gray-500 dark:text-gray-400">
            .localhost
          </span>
        </div>
        <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">{t("slug_hint")}</p>
      </div>

      <div className="mt-2 border-t border-gray-100 dark:border-gray-800 pt-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {t("owner_section")}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass} htmlFor="first_name">
            {t("first_name")}
          </label>
          <input
            id="first_name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="last_name">
            {t("last_name")}
          </label>
          <input
            id="last_name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>{t("phone")}</label>
        <div className="flex items-stretch gap-2">
          <PhoneInput
            international
            defaultCountry={defaultCountry as any}
            value={phone}
            onChange={(v) => {
              setPhone(v);
              setPhoneVerified(false);
            }}
            className="phone-input min-w-0 flex-1"
          />
          <button
            type="button"
            data-verified={phoneVerified}
            disabled={phoneVerified || !phone || !isValidPhoneNumber(phone)}
            onClick={() => setPhoneVerified(true)}
            className={verifyBtnClass}
          >
            {phoneVerified ? `✓ ${t("verified")}` : t("verify_btn")}
          </button>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="email">
          {t("email")}
        </label>
        <div className="flex items-stretch gap-2">
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailVerified(false);
            }}
            className={`${inputClass} min-w-0 flex-1`}
            required
          />
          <button
            type="button"
            data-verified={emailVerified}
            disabled={emailVerified || !email}
            onClick={() => setEmailVerified(true)}
            className={verifyBtnClass}
          >
            {emailVerified ? `✓ ${t("verified")}` : t("verify_btn")}
          </button>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="password">
          {t("password")}
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
        disabled={loading || !passwordValid || !passwordsMatch}
        className={submitBtnClass}
      >
        {loading ? "..." : t("signup_submit")}
      </button>

      <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
        {t("has_account")}{" "}
        <Link href={`/${locale}/auth/login`} className={linkBtnClass}>
          {t("login_title")}
        </Link>
      </p>
    </form>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <AuthLayout>
        <SignupForm />
      </AuthLayout>
    </Suspense>
  );
}
