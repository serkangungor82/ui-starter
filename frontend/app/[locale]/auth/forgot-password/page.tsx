"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { forgotPassword } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
      <div className="flex flex-1 items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm text-center">
          <div className="mb-4 text-4xl">📧</div>
          <h1 className="mb-2 text-xl font-bold">E-posta Gönderildi</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            <strong className="text-foreground">{email}</strong> adresine şifre sıfırlama kodu gönderdik. Gelen kutunuzu kontrol edin.
          </p>
          <Button
            onClick={() => router.push(`/${locale}/auth/reset-password?email=${encodeURIComponent(email)}`)}
            className="w-full h-11 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            Kodu Girdim, Devam Et
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            Kod gelmedi mi?{" "}
            <button
              onClick={() => setSent(false)}
              className="text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Tekrar gönder
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm">
          <h1 className="mb-2 text-2xl font-bold">Şifremi Unuttum</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Kayıtlı e-posta adresinizi girin, size sıfırlama kodu gönderelim.
          </p>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder="E-posta adresiniz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 px-4 text-sm"
              required
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="h-11 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              {loading ? "Gönderiliyor..." : "Kod Gönder"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link
              href={`/${locale}/auth/login`}
              className="text-indigo-600 hover:underline dark:text-indigo-400"
            >
              ← Giriş sayfasına dön
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
