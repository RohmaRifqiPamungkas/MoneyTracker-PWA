"use client";

import {
  Bell,
  Download,
  TrendingDown,
  TrendingUp,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getGreeting } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useEffect, useState } from "react";
import { TransactionDialog } from "@/components/layout/transaction-dialog";
import { signOutAction } from "@/lib/auth/actions";
import type { BankAccountRow } from "@/lib/supabase/types";
import type { AvailableTransactionCategories } from "@/lib/supabase/queries";

type DefaultType = "income" | "expense";

interface DashboardHeaderProps {
  bankAccounts: BankAccountRow[];
  availableCategories: AvailableTransactionCategories;
}

export function DashboardHeader({ bankAccounts, availableCategories }: DashboardHeaderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [defaultType, setDefaultType] = useState<DefaultType>("expense");

  useEffect(() => {
    setIsMounted(true);
    setIsOnline(navigator.onLine);
    setCurrentTime(new Date());

    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const openDialog = (type: DefaultType) => {
    setDefaultType(type);
    setDialogOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* Left: Logo + greeting */}
            <div className="flex items-center gap-3 min-w-0">
              {/* App icon */}
              <div className="hidden sm:flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm">
                <span className="text-sm font-bold text-white">M</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-sm font-semibold text-[var(--foreground)] sm:text-base">
                    {getGreeting()}, <span className="text-emerald-500">Pamungkas</span> 👋
                  </h1>
                  <Badge
                    variant={isMounted && !isOnline ? "destructive" : "default"}
                    className="hidden lg:inline-flex shrink-0 items-center gap-1 text-[10px]"
                  >
                    {isMounted && !isOnline ? (
                      <WifiOff className="h-2.5 w-2.5" />
                    ) : (
                      <Wifi className="h-2.5 w-2.5" />
                    )}
                    {isMounted && !isOnline ? "Offline" : "Online"}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {isMounted && currentTime ? format(currentTime, "EEEE, dd MMMM yyyy", { locale: id }) : "Memuat tanggal..."}
                </p>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Desktop quick-add buttons (lg+) */}
              <div className="hidden lg:flex items-center gap-2">
                <Button
                  variant="income"
                  size="sm"
                  onClick={() => openDialog("income")}
                  className="gap-1.5"
                >
                  <TrendingUp className="h-3.5 w-3.5" />
                  Pemasukan
                </Button>
                <Button
                  variant="expense"
                  size="sm"
                  onClick={() => openDialog("expense")}
                  className="gap-1.5"
                >
                  <TrendingDown className="h-3.5 w-3.5" />
                  Pengeluaran
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>
              </div>

              {/* Notification bell */}
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifikasi">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[var(--background)]" />
              </Button>

              {/* Avatar */}
              <button
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-bold text-white shadow-sm ring-2 ring-[var(--background)] transition-transform hover:scale-105 active:scale-95"
                aria-label="Profil"
              >
                P
              </button>
              <form action={signOutAction} className="hidden sm:block">
                <Button variant="outline" size="sm" type="submit">
                  Keluar
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Desktop dialog (mobile dialog comes from layout BottomNav) */}
      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultType={defaultType}
        bankAccounts={bankAccounts}
        availableCategories={availableCategories}
      />
    </>
  );
}
