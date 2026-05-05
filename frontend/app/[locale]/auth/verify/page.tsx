"use client";

import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { verify } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
  const t = useTranslations("auth");
  const { locale } = useParams<{ locale: string }>();
  const router = useRouter();

  const [emailCode, setEmailCode] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [emailDone, setEmailDone] = useState(false);
  const [smsDone, setSmsDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const verifyChannel = async (channel: "email" | "sms", code: string) => {
    setLoading(true);
    setError("");
    try {
      await verify({ channel, code });
      if (channel === "email") setEmailDone(true);
      else setSmsDone(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Kod hatalı");
    } finally {
      setLoading(false);
    }
  };

  if (emailDone && smsDone) {
    setTimeout(() => router.push(`/${locale}/generate`), 1500);
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-4xl mb-4">✓</div>
          <p className="text-lg font-medium text-green-600 dark:text-green-400">Doğrulama tamamlandı!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center mb-6">Hesabınızı Doğrulayın</h1>

        {/* E-posta doğrulama */}
        <div
          className={`rounded-2xl border p-6 ${emailDone ? "border-green-500/30 bg-green-500/10" : "border-border bg-card text-card-foreground"}`}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">{t("verify_email_title")}</h2>
            {emailDone && <span className="text-green-600 text-sm dark:text-green-400">✓ Doğrulandı</span>}
          </div>
          {!emailDone && (
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="000000"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
                maxLength={6}
                className="h-9 flex-1 text-center tracking-widest"
              />
              <Button
                onClick={() => verifyChannel("email", emailCode)}
                disabled={loading || emailCode.length < 6}
                className="h-9 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                {t("verify_submit")}
              </Button>
            </div>
          )}
        </div>

        {/* SMS doğrulama */}
        <div
          className={`rounded-2xl border p-6 ${smsDone ? "border-green-500/30 bg-green-500/10" : "border-border bg-card text-card-foreground"}`}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">{t("verify_sms_title")}</h2>
            {smsDone && <span className="text-green-600 text-sm dark:text-green-400">✓ Doğrulandı</span>}
          </div>
          {!smsDone && (
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="000000"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value)}
                maxLength={6}
                className="h-9 flex-1 text-center tracking-widest"
              />
              <Button
                onClick={() => verifyChannel("sms", smsCode)}
                disabled={loading || smsCode.length < 6}
                className="h-9 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                {t("verify_submit")}
              </Button>
            </div>
          )}
        </div>

        {error && <p className="text-center text-sm text-destructive">{error}</p>}
        <p className="text-center text-xs text-muted-foreground">
          Kodlar log dosyasında görünür (entegrasyon tamamlanana kadar)
        </p>
      </div>
    </div>
  );
}
