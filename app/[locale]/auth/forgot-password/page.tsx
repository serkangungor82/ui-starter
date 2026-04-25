"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { forgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
          <div className="mb-4 text-4xl">📧</div>
          <h1 className="mb-2 text-xl font-bold">E-posta Gönderildi</h1>
          <p className="mb-6 text-sm text-gray-500">
            <strong>{email}</strong> adresine şifre sıfırlama kodu gönderdik. Gelen kutunuzu kontrol edin.
          </p>
          <button
            onClick={() => router.push(`/${locale}/auth/reset-password?email=${encodeURIComponent(email)}`)}
            className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Kodu Girdim, Devam Et
          </button>
          <p className="mt-4 text-xs text-gray-400">
            Kod gelmedi mi?{" "}
            <button onClick={() => { setSent(false); }} className="text-indigo-600 hover:underline">
              Tekrar gönder
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-2 text-2xl font-bold">Şifremi Unuttum</h1>
          <p className="mb-6 text-sm text-gray-500">
            Kayıtlı e-posta adresinizi girin, size sıfırlama kodu gönderelim.
          </p>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="E-posta adresiniz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none"
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Gönderiliyor..." : "Kod Gönder"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            <Link href={`/${locale}/auth/login`} className="text-indigo-600 hover:underline">
              ← Giriş sayfasına dön
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
