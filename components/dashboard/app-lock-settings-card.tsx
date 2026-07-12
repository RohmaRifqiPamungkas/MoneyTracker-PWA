"use client";

import { useState, useEffect } from "react";
import { Lock, Unlock, KeyRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AppLockSettingsCard() {
  const [hasPin, setHasPin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pin, setPin] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedPin = localStorage.getItem("mt_app_pin");
    if (savedPin) {
      setHasPin(true);
    }
    setMounted(true);
  }, []);

  const handleSavePin = () => {
    if (pin.length === 4) {
      localStorage.setItem("mt_app_pin", pin);
      setHasPin(true);
      setIsEditing(false);
      setPin("");
    }
  };

  const handleRemovePin = () => {
    localStorage.removeItem("mt_app_pin");
    setHasPin(false);
  };

  if (!mounted) return null;

  return (
    <Card className="shadow-sm border-[var(--card-border)]">
      <CardHeader className="p-4 sm:p-6 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm sm:text-base font-semibold">Kunci Aplikasi (PIN)</CardTitle>
            <CardDescription className="text-[11px] sm:text-xs mt-0.5">
              Gunakan PIN 4 digit untuk melindungi data Anda
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
        {hasPin && !isEditing ? (
          <div className="flex items-center justify-between rounded-xl bg-emerald-500/5 p-3 border border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <Lock className="h-4 w-4" />
              <span className="text-xs font-semibold">PIN Aktif</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={() => setIsEditing(true)}>
                Ubah PIN
              </Button>
              <Button size="sm" variant="destructive" className="h-7 text-[10px] px-2 bg-rose-500 hover:bg-rose-600" onClick={handleRemovePin}>
                Hapus
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {!isEditing && !hasPin && (
              <div className="flex items-center justify-between rounded-xl bg-[var(--muted)]/40 p-3 border border-[var(--card-border)]/30">
                <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                  <Unlock className="h-4 w-4" />
                  <span className="text-xs font-semibold">PIN Nonaktif</span>
                </div>
                <Button size="sm" className="h-7 text-[10px] px-3 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => setIsEditing(true)}>
                  Aktifkan
                </Button>
              </div>
            )}
            
            {isEditing && (
              <div className="flex items-center gap-2 mt-2">
                <div className="relative flex-1">
                  <KeyRound className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
                  <Input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="Masukkan 4 Digit PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
                <Button size="sm" className="h-9 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handleSavePin} disabled={pin.length !== 4}>
                  Simpan
                </Button>
                <Button size="sm" variant="outline" className="h-9" onClick={() => { setIsEditing(false); setPin(""); }}>
                  Batal
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
