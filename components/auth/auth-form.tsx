"use client";

import { useActionState, useState } from "react";
import { Fingerprint, Loader2, LogIn, UserPlus } from "lucide-react";
import { signInAction, signUpAction, type AuthFormState } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const initialState: AuthFormState = {};

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loginState, loginAction, loginPending] = useActionState(signInAction, initialState);
  const [registerState, registerAction, registerPending] = useActionState(signUpAction, initialState);
  const [passkeyPending, setPasskeyPending] = useState(false);
  const [passkeyMessage, setPasskeyMessage] = useState<AuthFormState>({});
  const state = mode === "login" ? loginState : registerState;
  const pending = mode === "login" ? loginPending : registerPending;
  const supportsPasskey =
    typeof window !== "undefined" &&
    window.isSecureContext &&
    typeof window.PublicKeyCredential !== "undefined";

  const handlePasskeyLogin = async () => {
    setPasskeyPending(true);
    setPasskeyMessage({});

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPasskey();

    if (error) {
      setPasskeyMessage({ error: error.message });
      setPasskeyPending(false);
      return;
    }

    window.location.href = "/dashboard";
  };

  return (
    <Card className="w-full max-w-md border-[var(--card-border)] shadow-xl shadow-black/5">
      <CardHeader className="space-y-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-base font-bold text-white">
          M
        </div>
        <div>
          <CardTitle className="text-2xl">MoneyTracker</CardTitle>
          <CardDescription className="mt-1">
            {mode === "login"
              ? "Masuk untuk melihat dashboard keuangan Anda."
              : "Buat akun baru untuk mulai mencatat keuangan."}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 rounded-xl border border-[var(--card-border)] bg-[var(--muted)]/40 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              mode === "login" ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm" : "text-[var(--muted-foreground)]"
            )}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              mode === "register" ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm" : "text-[var(--muted-foreground)]"
            )}
          >
            Daftar
          </button>
        </div>

        <form action={mode === "login" ? loginAction : registerAction} className="space-y-4">
          {mode === "login" && (
            <div className="space-y-3">
              <Button
                type="button"
                className="h-11 w-full"
                disabled={!supportsPasskey || passkeyPending}
                onClick={() => void handlePasskeyLogin()}
              >
                {passkeyPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Fingerprint className="h-4 w-4" />
                )}
                Masuk dengan Face ID
              </Button>
              <p className="text-center text-xs text-[var(--muted-foreground)]">
                Face ID memakai passkey. Kalau belum aktif, Anda tetap bisa masuk dengan email dan password.
              </p>
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--card-border)]/60" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[var(--card)] px-2 text-[11px] text-[var(--muted-foreground)]">
                    atau gunakan password
                  </span>
                </div>
              </div>
            </div>
          )}

          {mode === "register" && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Nama</Label>
              <Input id="name" name="name" autoComplete="name" placeholder="Nama Anda" />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" placeholder="nama@email.com" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="Minimal 6 karakter"
            />
          </div>

          {(passkeyMessage.error || state.error) && (
            <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-600">
              {passkeyMessage.error || state.error}
            </p>
          )}
          {(passkeyMessage.success || state.success) && (
            <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700">
              {passkeyMessage.success || state.success}
            </p>
          )}

          <Button type="submit" className="h-11 w-full" disabled={pending}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode === "login" ? (
              <LogIn className="h-4 w-4" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {mode === "login" ? "Masuk" : "Buat Akun"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
