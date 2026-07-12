"use client";

import { useEffect, useState } from "react";
import { Lock, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppLockProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [pin, setPin] = useState("");
  const [inputPin, setInputPin] = useState("");
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedPin = localStorage.getItem("mt_app_pin");
    if (savedPin) {
      setPin(savedPin);
      setIsLocked(true);
    }
    setMounted(true);
  }, []);

  const handleKeyPress = (num: string) => {
    if (inputPin.length < 4) {
      const newPin = inputPin + num;
      setInputPin(newPin);
      setError(false);
      
      if (newPin.length === 4) {
        if (newPin === pin) {
          setIsLocked(false);
          setInputPin("");
        } else {
          setError(true);
          setTimeout(() => setInputPin(""), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setInputPin(prev => prev.slice(0, -1));
    setError(false);
  };

  if (!mounted) return null;

  if (isLocked) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[var(--background)] flex flex-col items-center justify-center">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
          <Lock className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold mb-2">Aplikasi Terkunci</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-8">Masukkan PIN untuk membuka MoneyTracker</p>

        <div className="flex gap-4 mb-12">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full transition-colors ${
                i < inputPin.length
                  ? "bg-emerald-500"
                  : error
                  ? "bg-rose-500/50"
                  : "bg-[var(--card-border)]"
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 sm:gap-6 w-full max-w-[280px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              className="flex h-16 items-center justify-center rounded-full text-2xl font-semibold bg-[var(--card)] border border-[var(--card-border)] hover:bg-[var(--muted)] active:scale-95 transition-all shadow-sm"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleKeyPress("0")}
            className="flex h-16 items-center justify-center rounded-full text-2xl font-semibold bg-[var(--card)] border border-[var(--card-border)] hover:bg-[var(--muted)] active:scale-95 transition-all shadow-sm"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="flex h-16 items-center justify-center rounded-full text-xl bg-[var(--card)] border border-[var(--card-border)] hover:bg-[var(--muted)] active:scale-95 transition-all shadow-sm"
          >
            <Delete className="h-6 w-6 text-[var(--muted-foreground)]" />
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
