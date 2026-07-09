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
import { getGreeting, formatCurrency } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { useEffect, useState, useRef } from "react";
import { TransactionDialog } from "@/components/layout/transaction-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { signOutAction } from "@/lib/auth/actions";
import type { BankAccountRow, TransactionRow } from "@/lib/supabase/types";
import type { AvailableTransactionCategories } from "@/lib/supabase/queries";

type DefaultType = "income" | "expense";

interface DashboardHeaderProps {
  bankAccounts: BankAccountRow[];
  availableCategories: AvailableTransactionCategories;
  recentNotifications: TransactionRow[];
}

export function DashboardHeader({ bankAccounts, availableCategories, recentNotifications = [] }: DashboardHeaderProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotifOpen]);

  const openDialog = (type: DefaultType) => {
    setDefaultType(type);
    setDialogOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 sm:top-0 z-30 w-full px-3 sm:px-0 pt-3 sm:pt-0">
        <div className="mx-auto max-w-screen-xl sm:px-6 lg:px-8">
          <div className="flex h-[52px] sm:h-16 items-center justify-between gap-3 sm:gap-4 rounded-[1.25rem] sm:rounded-none border border-[var(--card-border)]/60 sm:border-x-0 sm:border-t-0 sm:border-b bg-[var(--card)]/80 sm:bg-[var(--background)]/80 px-3 sm:px-0 shadow-sm sm:shadow-none backdrop-blur-xl">

            {/* Left: Avatar + greeting */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              {/* Avatar on the left for mobile app feel */}
              <button
                className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-xs sm:text-sm font-bold text-white shadow-sm ring-2 ring-[var(--card)] sm:ring-[var(--background)] transition-transform hover:scale-105 active:scale-95"
                aria-label="Profil"
              >
                P
              </button>
              
              <div className="min-w-0 flex flex-col justify-center">
                <span className="text-[9px] sm:text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider leading-none mb-1">
                  {getGreeting()} 👋
                </span>
                <div className="flex items-center gap-1.5">
                  <h1 className="truncate text-xs sm:text-sm font-extrabold text-[var(--foreground)] leading-none">
                    Pamungkas
                  </h1>
                  <Badge
                    variant={isMounted && !isOnline ? "destructive" : "default"}
                    className="hidden lg:inline-flex shrink-0 items-center gap-1 h-4 px-1.5 text-[8px]"
                  >
                    {isMounted && !isOnline ? (
                      <WifiOff className="h-2 w-2" />
                    ) : (
                      <Wifi className="h-2 w-2" />
                    )}
                    {isMounted && !isOnline ? "Offline" : "Online"}
                  </Badge>
                </div>
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
              <div className="relative" ref={notifRef}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative" 
                  aria-label="Notifikasi"
                  onClick={() => setIsNotifOpen((prev) => !prev)}
                >
                  <Bell className="h-4 w-4" />
                  {recentNotifications.length > 0 && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[var(--background)]" />
                  )}
                </Button>

                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="fixed left-4 right-4 top-[72px] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 w-auto sm:w-80 origin-top sm:origin-top-right rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-2xl backdrop-blur-xl z-50"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-[var(--foreground)]">Notifikasi <span className="text-emerald-500 font-semibold">(24 Jam)</span></h3>
                        <span className="text-xs font-medium text-[var(--muted-foreground)] bg-[var(--muted)] px-2 py-0.5 rounded-full">{recentNotifications.length} Baru</span>
                      </div>
                      
                      <div className="flex max-h-[320px] flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
                        {recentNotifications.length === 0 ? (
                          <div className="py-8 flex flex-col items-center justify-center gap-2 text-center">
                            <Bell className="h-8 w-8 text-[var(--muted-foreground)] opacity-20" />
                            <span className="text-sm text-[var(--muted-foreground)]">Tidak ada aktivitas baru.</span>
                          </div>
                        ) : (
                          recentNotifications.map((notif) => {
                            const isIncome = notif.type === "income";
                            const Icon = isIncome ? TrendingUp : TrendingDown;
                            return (
                              <div key={notif.id} className="group flex items-start gap-3.5 rounded-xl border border-transparent bg-[var(--background)]/40 p-3 transition-all hover:border-[var(--card-border)] hover:bg-[var(--muted)]/50 hover:shadow-sm">
                                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isIncome ? 'bg-emerald-500/10 text-emerald-500 shadow-inner shadow-emerald-500/20' : 'bg-rose-500/10 text-rose-500 shadow-inner shadow-rose-500/20'}`}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-[var(--foreground)] group-hover:text-emerald-500 transition-colors">
                                    {notif.name}
                                  </p>
                                  <div className="mt-1 flex flex-col gap-0.5">
                                    <span className={`text-sm font-bold tracking-tight ${isIncome ? 'text-emerald-500' : 'text-[var(--foreground)]'}`}>
                                      {isIncome ? "+" : ""}{formatCurrency(notif.amount)}
                                    </span>
                                    <span className="text-[10px] font-medium text-[var(--muted-foreground)] opacity-80">
                                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: id })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Desktop Logout Button */}
              <form action={signOutAction} className="hidden sm:block">
                <Button variant="outline" size="sm" type="submit" className="h-8 text-xs font-semibold rounded-xl">
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
