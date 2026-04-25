"use client";

import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { verify } from "@/lib/api";

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">✓</div>
          <p className="text-lg font-medium text-green-600">Doğrulama tamamlandı!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center mb-6">Hesabınızı Doğrulayın</h1>

        {/* E-posta doğrulama */}
        <div className={`rounded-2xl border p-6 ${emailDone ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"}`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">{t("verify_email_title")}</h2>
            {emailDone && <span className="text-green-600 text-sm">✓ Doğrulandı</span>}
          </div>
          {!emailDone && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="000000"
                value={emailCode}
                onChange={(e) => setEmailCode(e.target.value)}
                maxLength={6}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm tracking-widest focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={() => verifyChannel("email", emailCode)}
                disabled={loading || emailCode.length < 6}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {t("verify_submit")}
              </button>
            </div>
          )}
        </div>

        {/* SMS doğrulama */}
        <div className={`rounded-2xl border p-6 ${smsDone ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"}`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">{t("verify_sms_title")}</h2>
            {smsDone && <span className="text-green-600 text-sm">✓ Doğrulandı</span>}
          </div>
          {!smsDone && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="000000"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value)}
                maxLength={6}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm tracking-widest focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={() => verifyChannel("sms", smsCode)}
                disabled={loading || smsCode.length < 6}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {t("verify_submit")}
              </button>
            </div>
          )}
        </div>

        {error && <p className="text-center text-sm text-red-500">{error}</p>}
        <p className="text-center text-xs text-gray-400">
          Kodlar log dosyasında görünür (entegrasyon tamamlanana kadar)
        </p>
      </div>
    </div>
  );
}
