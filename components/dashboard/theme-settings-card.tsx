"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Laptop, Palette } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ThemeSettingsCard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card className="shadow-sm border-[var(--card-border)]">
        <CardHeader className="p-4 sm:p-6 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
              <Palette className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-semibold">Tampilan (Tema)</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 space-y-3">
          <div className="h-10 bg-[var(--muted)] animate-pulse rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-[var(--card-border)]">
      <CardHeader className="p-4 sm:p-6 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
            <Palette className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-sm sm:text-base font-semibold">Tampilan (Tema)</CardTitle>
            <CardDescription className="text-[11px] sm:text-xs mt-0.5">
              Sesuaikan mode terang atau gelap sesuai kenyamanan Anda
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            className={`flex flex-col gap-1.5 h-auto py-3 rounded-xl border ${
              theme === "light"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                : "border-[var(--card-border)] text-[var(--muted-foreground)]"
            }`}
            onClick={() => setTheme("light")}
          >
            <Sun className="h-4 w-4 mb-1" />
            <span className="text-xs font-semibold">Terang</span>
          </Button>
          
          <Button
            variant="outline"
            className={`flex flex-col gap-1.5 h-auto py-3 rounded-xl border ${
              theme === "dark"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-[var(--card-border)] text-[var(--muted-foreground)]"
            }`}
            onClick={() => setTheme("dark")}
          >
            <Moon className="h-4 w-4 mb-1" />
            <span className="text-xs font-semibold">Gelap</span>
          </Button>

          <Button
            variant="outline"
            className={`flex flex-col gap-1.5 h-auto py-3 rounded-xl border ${
              theme === "system"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-[var(--card-border)] text-[var(--muted-foreground)]"
            }`}
            onClick={() => setTheme("system")}
          >
            <Laptop className="h-4 w-4 mb-1" />
            <span className="text-xs font-semibold">Sistem</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
