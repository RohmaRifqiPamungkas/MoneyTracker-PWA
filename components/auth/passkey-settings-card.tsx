"use client";

import { useEffect, useState } from "react";
import { Fingerprint, KeyRound, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PasskeyListItem {
  id: string;
  friendly_name?: string;
  created_at: string;
  last_used_at?: string;
}

function formatDateTime(value?: string) {
  if (!value) return "Belum pernah dipakai";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function PasskeySettingsCard() {
  const isSupported =
    typeof window !== "undefined" &&
    window.isSecureContext &&
    typeof window.PublicKeyCredential !== "undefined";
  const [loading, setLoading] = useState(isSupported);
  const [registering, setRegistering] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [passkeys, setPasskeys] = useState<PasskeyListItem[]>([]);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const loadPasskeys = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.passkey.list();

    if (error) {
      setMessage({ type: "error", text: error.message });
      setPasskeys([]);
    } else {
      setPasskeys(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!isSupported) return;

    const timer = window.setTimeout(() => {
      void loadPasskeys();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isSupported]);

  const handleRegisterPasskey = async () => {
    setRegistering(true);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.registerPasskey();

    if (error) {
      setMessage({ type: "error", text: error.message });
      setRegistering(false);
      return;
    }

    setMessage({
      type: "success",
      text: "Face ID / passkey berhasil diaktifkan untuk akun ini.",
    });
    setRegistering(false);
    await loadPasskeys();
  };

  const handleDeletePasskey = async (passkeyId: string) => {
    setRemovingId(passkeyId);
    setMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.passkey.delete({ passkeyId });

    if (error) {
      setMessage({ type: "error", text: error.message });
      setRemovingId(null);
      return;
    }

    setMessage({
      type: "success",
      text: "Passkey berhasil dihapus. Login password tetap bisa dipakai.",
    });
    setRemovingId(null);
    await loadPasskeys();
  };

  return (
    <Card className="shadow-sm border-[var(--card-border)]">
      <CardHeader className="p-4 sm:p-6 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
            <Fingerprint className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm sm:text-base font-semibold">Face ID / Passkey</CardTitle>
            <CardDescription className="text-[11px] sm:text-xs mt-0.5">
              Jadikan Face ID sebagai opsi login utama tanpa menghapus login password.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0 space-y-3.5">
        <div className="flex items-center justify-between rounded-xl bg-[var(--muted)]/40 p-3 border border-[var(--card-border)]/30">
          <span className="text-xs font-semibold text-[var(--foreground)]">Status perangkat</span>
          <Badge variant={isSupported ? "default" : "warning"}>
            {isSupported ? "Siap digunakan" : "Belum didukung"}
          </Badge>
        </div>

        {!isSupported && (
          <p className="text-[11px] text-[var(--muted-foreground)]">
            Passkey butuh browser yang mendukung WebAuthn dan koneksi aman HTTPS atau `localhost`.
          </p>
        )}

        {message && (
          <div
            className={
              message.type === "success"
                ? "rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700"
                : "rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-600"
            }
          >
            {message.text}
          </div>
        )}

        <Button
          type="button"
          onClick={handleRegisterPasskey}
          disabled={!isSupported || registering}
          className="w-full h-10 text-xs font-semibold"
        >
          {registering ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
          Aktifkan Face ID
        </Button>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[var(--foreground)]">Passkey terdaftar</p>
            <Badge variant="secondary">{loading ? "..." : `${passkeys.length} aktif`}</Badge>
          </div>

          {loading ? (
            <div className="rounded-xl border border-[var(--card-border)]/30 p-3 text-xs text-[var(--muted-foreground)]">
              Memuat daftar passkey...
            </div>
          ) : passkeys.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--card-border)]/40 p-3 text-xs text-[var(--muted-foreground)]">
              Belum ada passkey. Password tetap menjadi fallback login Anda.
            </div>
          ) : (
            <div className="space-y-2">
              {passkeys.map((passkey, index) => (
                <div
                  key={passkey.id}
                  className="flex items-center gap-3 rounded-xl border border-[var(--card-border)]/30 bg-[var(--muted)]/20 p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--card)] text-emerald-500">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[var(--foreground)]">
                      {passkey.friendly_name || `Face ID ${index + 1}`}
                    </p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">
                      Dibuat {formatDateTime(passkey.created_at)}
                    </p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">
                      Dipakai terakhir {formatDateTime(passkey.last_used_at)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={removingId === passkey.id}
                    onClick={() => void handleDeletePasskey(passkey.id)}
                    className="shrink-0 text-rose-500 hover:text-rose-500 hover:bg-rose-500/10"
                  >
                    {removingId === passkey.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
