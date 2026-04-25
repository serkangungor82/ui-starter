"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { resetPassword } from "@/lib/api";

const PASSWORD_RULES = [
  { label: "En az 8 karakter", test: (p: string) => p.length >= 8 },
  { label: "Büyük harf (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Küçük harf (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { label: "Rakam (0-9)", test: (p: string) => /[0-9]/.test(p) },
  { label: "Özel karakter (!@#...)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function ResetForm() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const passwordValid = PASSWORD_RULES.every((r) => r.test(password));
  const passwordMatch = password === confirm && confirm.length > 0;
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  const barColors = ["bg-red-400", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid) { setError("Şifre gereksinimlerini karşılamıyor"); return; }
    if (!passwordMatch) { setError("Şifreler eşleşmiyor"); return; }
    setLoading(true);
    setError("");
    try {
      await resetPassword({ email: emailParam, code, password });
      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Kod hatalı veya süresi dolmuş");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          <div className="mb-4 text-4xl">✅</div>
          <h1 className="mb-2 text-xl font-bold">Şifre Güncellendi</h1>
          <p className="mb-6 text-sm text-gray-500">Yeni şifrenizle giriş yapabilirsiniz.</p>
          <Link
            href={`/${locale}/auth/login`}
            className="block w-full rounded-lg bg-indigo-600 py-3 text-center text-sm font-medium text-white hover:bg-indigo-700"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-2xl font-bold">Şifre Sıfırla</h1>
          {emailParam && (
            <p className="mb-6 text-sm text-gray-500">
              <strong>{emailParam}</strong> adresine gönderilen kodu girin.
            </p>
          )}

          <form onSubmit={submit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="6 haneli doğrulama kodu"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="rounded-lg border border-gray-300 px-4 py-3 text-center text-lg tracking-widest focus:border-indigo-500 focus:outline-none"
              maxLength={6}
              required
            />

            <div>
              <input
                type="password"
                placeholder="Yeni şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
                required
              />
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {PASSWORD_RULES.map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i < passed ? barColors[passed - 1] : "bg-gray-200"}`} />
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
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Yeni şifreyi tekrar girin"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none ${
                  confirm && !passwordMatch ? "border-red-400" : "border-gray-300 focus:border-indigo-500"
                }`}
                required
              />
              {confirm && !passwordMatch && (
                <p className="mt-1 text-xs text-red-500">Şifreler eşleşmiyor</p>
              )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading || !passwordValid || !passwordMatch || code.length !== 6}
              className="rounded-lg bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            <Link href={`/${locale}/auth/forgot-password`} className="text-indigo-600 hover:underline">
              ← Kod tekrar gönder
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
