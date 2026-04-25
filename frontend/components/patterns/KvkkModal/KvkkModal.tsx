"use client";

import { useState } from "react";

export type KvkkModalProps = {
  /** SMS doğrulama kodu için kullanıcının telefonu (gösterim amaçlı, opsiyonel) */
  phone?: string | null;
  /** Aydınlatma metni — kendi şirketinize göre uyarlayın */
  aydinlatmaMetni: string;
  /** SMS kodu gönderir */
  onSendSms: () => Promise<unknown>;
  /** Girilen kodla doğrulama yapar; başarılıysa Promise resolve, hatalıysa throw */
  onVerify: (code: string) => Promise<unknown>;
  /** Kullanıcı reddederse çağırılır (server tarafına da bildirim gönderebilir) */
  onDecline: () => Promise<unknown>;
  /** Doğrulama başarılı olduktan sonra çağırılır */
  onAccepted: () => void;
  /** Reddedildikten sonra çağırılır */
  onDeclined: () => void;
};

/**
 * Türkiye KVKK uyumluluğu için aydınlatma + açık rıza modali.
 * - Kullanıcı aydınlatma metnini açıp okuyabilir
 * - "Onay veriyorum" → SMS ile doğrulama akışı
 * - "Onay vermiyorum" → reddetme + devam
 *
 * Tasarım: indigo header, yeşil onay yolu, kırmızı red yolu.
 */
export default function KvkkModal({
  phone,
  aydinlatmaMetni,
  onSendSms,
  onVerify,
  onDecline,
  onAccepted,
  onDeclined,
}: KvkkModalProps) {
  const [aydinlatmaOpen, setAydinlatmaOpen] = useState(false);
  const [choice, setChoice] = useState<"accept" | "decline" | null>(null);
  const [smsSent, setSmsSent] = useState(false);
  const [smsLoading, setSmsLoading] = useState(false);
  const [code, setCode] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [declineLoading, setDeclineLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendSms = async () => {
    setError("");
    setSmsLoading(true);
    try {
      await onSendSms();
      setSmsSent(true);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "SMS gönderilemedi");
    } finally {
      setSmsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) { setError("6 haneli kodu girin"); return; }
    setError("");
    setVerifyLoading(true);
    try {
      await onVerify(code);
      onAccepted();
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Kod hatalı veya süresi dolmuş");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleDecline = async () => {
    setDeclineLoading(true);
    try {
      await onDecline();
    } catch {
      // server hatasını yutuyoruz; UI akışı yine devam etsin
    } finally {
      onDeclined();
      setDeclineLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="border-b border-gray-100 px-7 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Kişisel Verilerin Korunması</h2>
              <p className="text-sm text-gray-500">Devam etmeden önce lütfen aydınlatma metnini okuyunuz.</p>
            </div>
          </div>
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-7 py-5 space-y-5">
          {/* Aydınlatma Metni */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/70">
            <button
              type="button"
              onClick={() => setAydinlatmaOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-sm font-semibold text-gray-800 hover:bg-gray-100/50 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <svg className="h-4 w-4 text-indigo-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                KVKK Aydınlatma Metni
              </div>
              <svg className={`h-4 w-4 text-gray-400 transition-transform ${aydinlatmaOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {aydinlatmaOpen && (
              <div className="border-t border-gray-200 px-5 py-4 text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                {aydinlatmaMetni}
              </div>
            )}
          </div>

          {/* Tercih */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Tercihini Seç</p>

            <label className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-colors ${
              choice === "accept" ? "border-green-500 bg-green-50/60" : "border-gray-200 bg-white hover:border-green-200 hover:bg-gray-50"
            }`}>
              <input type="radio" name="kvkk" checked={choice === "accept"}
                onChange={() => { setChoice("accept"); setError(""); setSmsSent(false); setCode(""); }}
                className="mt-0.5 accent-green-600" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Onay veriyorum</p>
                <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
                  Aydınlatma metnini okudum, anladım ve kişisel verilerimin işlenmesine onay veriyorum.
                </p>
              </div>
            </label>

            <label className={`flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-colors ${
              choice === "decline" ? "border-red-400 bg-red-50/60" : "border-gray-200 bg-white hover:border-red-200 hover:bg-gray-50"
            }`}>
              <input type="radio" name="kvkk" checked={choice === "decline"}
                onChange={() => { setChoice("decline"); setError(""); }}
                className="mt-0.5 accent-red-500" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Onay vermiyorum</p>
                <p className="mt-0.5 text-xs text-gray-500 leading-relaxed">
                  Aydınlatma metnini okudum fakat kişisel verilerimin işlenmesine onay vermiyorum.
                </p>
              </div>
            </label>
          </div>

          {/* SMS doğrulama */}
          {choice === "accept" && (
            <div className="rounded-xl border border-green-100 bg-green-50 px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="h-4 w-4 text-green-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18h3" />
                </svg>
                <p className="text-sm font-semibold text-green-700">SMS ile Kimlik Doğrulama</p>
              </div>
              <p className="mb-4 text-xs text-green-700 text-center">
                {phone
                  ? <><strong className="font-semibold">{phone}</strong> numarasına doğrulama kodu gönderilecektir.</>
                  : "Kayıtlı telefon numaranıza doğrulama kodu gönderilecektir."}
              </p>
              {!smsSent ? (
                <div className="flex justify-center">
                  <button type="button" onClick={handleSendSms} disabled={smsLoading}
                    className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors">
                    {smsLoading ? "Gönderiliyor..." : "SMS Kodu Gönder"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap justify-center items-center gap-3">
                  <input type="text" maxLength={6} value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-36 rounded-lg border border-green-200 bg-white px-3 py-2.5 text-center text-lg font-mono tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-green-400" />
                  <button type="button" onClick={handleVerify} disabled={verifyLoading || code.length !== 6}
                    className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors">
                    {verifyLoading ? "Doğrulanıyor..." : "Onayla"}
                  </button>
                  <button type="button" onClick={handleSendSms}
                    className="text-xs text-green-600 hover:text-green-800 underline">
                    Tekrar gönder
                  </button>
                </div>
              )}
              {error && <p className="mt-3 text-xs text-red-600 text-center">{error}</p>}
            </div>
          )}

          {/* Reddet */}
          {choice === "decline" && (
            <div className="rounded-xl border border-red-100 bg-red-50/70 px-5 py-4 flex flex-col items-center text-center">
              <p className="mb-4 text-xs text-red-700 leading-relaxed">
                Platformu kullanmaya devam edebilirsiniz. Ancak bazı özellikler kısıtlı olabilir.
              </p>
              <button type="button" onClick={handleDecline} disabled={declineLoading}
                className="rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition-colors">
                {declineLoading ? "..." : "Devam Et"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
