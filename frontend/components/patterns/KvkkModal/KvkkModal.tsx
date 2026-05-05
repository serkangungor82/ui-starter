"use client";

import { useState } from "react";
import { ChevronDown, FileText, Phone, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type KvkkModalProps = {
  /** Modalın açık/kapalı durumu (caller kontrol eder) */
  open: boolean;
  /** Açık/kapalı değişikliği için handler */
  onOpenChange: (open: boolean) => void;
  /** SMS doğrulama kodu için kullanıcının telefonu (gösterim amaçlı) */
  phone?: string | null;
  /** Aydınlatma metni — kendi şirketinize göre uyarlayın */
  aydinlatmaMetni: string;
  /** SMS kodu gönderir */
  onSendSms: () => Promise<unknown>;
  /** Girilen kodla doğrulama yapar; başarılıysa resolve, hatalıysa throw */
  onVerify: (code: string) => Promise<unknown>;
  /** Kullanıcı reddederse çağırılır */
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
 */
export default function KvkkModal({
  open,
  onOpenChange,
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

  const resetError = () => setError("");

  const handleSendSms = async () => {
    resetError();
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
    if (code.length !== 6) {
      setError("6 haneli kodu girin");
      return;
    }
    resetError();
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-lg">Kişisel Verilerin Korunması</DialogTitle>
              <DialogDescription>
                Devam etmeden önce lütfen aydınlatma metnini okuyunuz.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
          {/* Aydınlatma Metni — collapsible */}
          <div className="rounded-xl border border-border bg-muted/40">
            <button
              type="button"
              onClick={() => setAydinlatmaOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-3 rounded-xl px-5 py-3.5 text-sm font-semibold transition-colors hover:bg-muted"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="size-4 shrink-0 text-primary" />
                KVKK Aydınlatma Metni
              </div>
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground transition-transform",
                  aydinlatmaOpen && "rotate-180"
                )}
              />
            </button>
            {aydinlatmaOpen && (
              <div className="border-t border-border px-5 py-4 text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                {aydinlatmaMetni}
              </div>
            )}
          </div>

          {/* Tercih kartları */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Tercihini Seç
            </p>

            <button
              type="button"
              onClick={() => {
                setChoice("accept");
                resetError();
                setSmsSent(false);
                setCode("");
              }}
              className={cn(
                "w-full text-left rounded-xl border-2 p-4 transition-colors",
                choice === "accept"
                  ? "border-emerald-500 bg-emerald-500/5"
                  : "border-border bg-card hover:border-emerald-500/40 hover:bg-muted/40"
              )}
            >
              <p className="text-sm font-semibold">Onay veriyorum</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Aydınlatma metnini okudum, anladım ve kişisel verilerimin işlenmesine onay
                veriyorum.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                setChoice("decline");
                resetError();
              }}
              className={cn(
                "w-full text-left rounded-xl border-2 p-4 transition-colors",
                choice === "decline"
                  ? "border-destructive bg-destructive/5"
                  : "border-border bg-card hover:border-destructive/40 hover:bg-muted/40"
              )}
            >
              <p className="text-sm font-semibold">Onay vermiyorum</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Aydınlatma metnini okudum fakat kişisel verilerimin işlenmesine onay
                vermiyorum.
              </p>
            </button>
          </div>

          {/* SMS doğrulama */}
          {choice === "accept" && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-5 py-4">
              <div className="mb-3 flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  SMS ile Kimlik Doğrulama
                </p>
              </div>
              <p className="mb-4 text-center text-xs text-emerald-700 dark:text-emerald-300/90">
                {phone ? (
                  <>
                    <strong className="font-semibold">{phone}</strong> numarasına doğrulama kodu
                    gönderilecektir.
                  </>
                ) : (
                  "Kayıtlı telefon numaranıza doğrulama kodu gönderilecektir."
                )}
              </p>
              {!smsSent ? (
                <div className="flex justify-center">
                  <Button
                    type="button"
                    onClick={handleSendSms}
                    disabled={smsLoading}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    {smsLoading ? "Gönderiliyor..." : "SMS Kodu Gönder"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-end justify-center gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="kvkk-otp" className="text-xs text-emerald-700 dark:text-emerald-300">
                        Doğrulama kodu
                      </Label>
                      <Input
                        id="kvkk-otp"
                        type="text"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="000000"
                        className="w-36 text-center font-mono text-lg tracking-[0.4em]"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleVerify}
                      disabled={verifyLoading || code.length !== 6}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      {verifyLoading ? "Doğrulanıyor..." : "Onayla"}
                    </Button>
                  </div>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleSendSms}
                      className="text-xs text-emerald-700 underline hover:text-emerald-900 dark:text-emerald-300 dark:hover:text-emerald-100"
                    >
                      Tekrar gönder
                    </button>
                  </div>
                </div>
              )}
              {error && (
                <Alert variant="destructive" className="mt-3">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Reddet */}
          {choice === "decline" && (
            <div className="flex flex-col items-center rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-center">
              <p className="mb-4 text-xs leading-relaxed text-destructive">
                Platformu kullanmaya devam edebilirsiniz. Ancak bazı özellikler kısıtlı olabilir.
              </p>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDecline}
                disabled={declineLoading}
              >
                {declineLoading ? "..." : "Devam Et"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
