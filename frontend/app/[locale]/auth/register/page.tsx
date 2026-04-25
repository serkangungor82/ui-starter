"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { register, login } from "@/lib/api";
import { setToken } from "@/lib/auth";

const PASSWORD_RULES = [
  { label: "En az 8 karakter", test: (p: string) => p.length >= 8 },
  { label: "Büyük harf (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Küçük harf (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { label: "Rakam (0-9)", test: (p: string) => /[0-9]/.test(p) },
  { label: "Özel karakter (!@#...)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const colors = ["bg-red-400", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {PASSWORD_RULES.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < passed ? colors[passed - 1] : "bg-gray-200"}`} />
        ))}
      </div>
      <ul className="space-y-0.5">
        {PASSWORD_RULES.map((rule) => (
          <li key={rule.label} className={`flex items-center gap-1.5 text-xs ${rule.test(password) ? "text-green-600" : "text-gray-400"}`}>
            <span>{rule.test(password) ? "✓" : "○"}</span>
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();

  const defaultCountry = locale === "en" ? "US" : "TR";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<string | undefined>();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordValid = PASSWORD_RULES.every((r) => r.test(password));
  const passwordMatch = password === confirm && confirm.length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) { setError("Ad alanı zorunludur"); return; }
    if (!lastName.trim()) { setError("Soyad alanı zorunludur"); return; }
    if (!passwordValid) { setError("Şifre gereksinimlerini karşılamıyor"); return; }
    if (!passwordMatch) { setError("Şifreler eşleşmiyor"); return; }
    if (!phone || !isValidPhoneNumber(phone)) { setError("Geçerli bir telefon numarası girin"); return; }

    setLoading(true);
    setError("");
    try {
      await register({ email, first_name: firstName, last_name: lastName, phone, password });
      const loginRes = await login({ email, password });
      setToken(loginRes.data.access_token);
      router.push(`/${locale}/auth/verify`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <Link href={`/${locale}`} className="mb-4 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          {locale === "tr" ? "Anasayfa" : "Home"}
        </Link>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-2xl font-bold">{t("register_title")}</h1>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder={t("first_name")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="min-w-0 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
                required
              />
              <input
                type="text"
                placeholder={t("last_name")}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="min-w-0 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            <input
              type="email"
              placeholder={t("email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
              required
            />

            <div>
              <PhoneInput
                international
                defaultCountry={defaultCountry as any}
                value={phone}
                onChange={setPhone}
                className="phone-input"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder={t("password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
                required
              />
              <PasswordStrength password={password} />
            </div>

            <div>
              <input
                type="password"
                placeholder={t("confirm_password")}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none ${
                  confirm && !passwordMatch ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-indigo-500"
                }`}
                required
              />
              {confirm && !passwordMatch && (
                <p className="mt-1 text-xs text-red-500">{t("passwords_no_match")}</p>
              )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading || !passwordValid || !passwordMatch}
              className="rounded-lg bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "..." : t("register_submit")}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            {t("has_account")}{" "}
            <Link href={`/${locale}/auth/login`} className="text-indigo-600 hover:underline">
              {t("login_title")}
            </Link>
          </p>

          <div className="relative mt-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs text-gray-400"><span className="bg-white px-2">{t("or_continue_with")}</span></div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <a href={`${API_BASE}/auth/google`} className="flex items-center justify-center gap-3 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t("google_register")}
            </a>
            <a href={`${API_BASE}/auth/microsoft`} className="flex items-center justify-center gap-3 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#F25022" d="M1 1h10v10H1z"/>
                <path fill="#00A4EF" d="M13 1h10v10H13z"/>
                <path fill="#7FBA00" d="M1 13h10v10H1z"/>
                <path fill="#FFB900" d="M13 13h10v10H13z"/>
              </svg>
              {t("microsoft_register")}
            </a>
            <a href={`${API_BASE}/auth/github`} className="flex items-center justify-center gap-3 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              {t("github_register")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
