"use client";

import { Suspense, useState, useEffect, startTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Wallet, Target, Calendar } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FinancialOverview } from "@/components/dashboard/financial-overview";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  TransactionRow,
  BankAccountRow,
  BudgetItemRow,
  SavingsGoalRow,
  UpcomingBillRow,
} from "@/lib/supabase/types";
import type { MonthlyData, CategoryExpense, Insight, FinancialSummary } from "@/lib/types";
import type { AvailableTransactionCategories } from "@/lib/supabase/queries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

// Lazy load heavy chart components to improve page load performance
const CashflowChart = dynamic(
  () => import("@/components/dashboard/cashflow-chart").then((m) => m.CashflowChart),
  {
    loading: () => <ChartSkeleton h="h-72" />,
    ssr: false,
  }
);

const ExpenseChart = dynamic(
  () => import("@/components/dashboard/expense-chart").then((m) => m.ExpenseChart),
  {
    loading: () => <ChartSkeleton h="h-64" />,
    ssr: false,
  }
);

const FinancialInsights = dynamic(
  () => import("@/components/dashboard/financial-insights").then((m) => m.FinancialInsights),
  {
    loading: () => <WidgetSkeleton rows={3} />,
    ssr: false,
  }
);

const RecentTransactions = dynamic(
  () => import("@/components/dashboard/recent-transactions").then((m) => m.RecentTransactions),
  {
    loading: () => <TransactionListSkeleton />,
    ssr: false,
  }
);

const BudgetProgress = dynamic(
  () => import("@/components/dashboard/budget-progress").then((m) => m.BudgetProgress),
  {
    loading: () => <WidgetSkeleton rows={3} />,
    ssr: false,
  }
);

const GoalsTracker = dynamic(
  () => import("@/components/dashboard/goals-tracker").then((m) => m.GoalsTracker),
  {
    loading: () => <WidgetSkeleton rows={2} />,
    ssr: false,
  }
);

const UpcomingBills = dynamic(
  () => import("@/components/dashboard/upcoming-bills").then((m) => m.UpcomingBills),
  {
    loading: () => <WidgetSkeleton rows={2} />,
    ssr: false,
  }
);

const QuickTransactionForm = dynamic(
  () => import("@/components/dashboard/quick-transaction-form").then((m) => m.QuickTransactionForm),
  {
    loading: () => <FormSkeleton />,
    ssr: false,
  }
);

const BankAccountsWidget = dynamic(
  () => import("@/components/dashboard/bank-accounts").then((m) => m.BankAccountsWidget),
  {
    loading: () => <BankAccountsSkeleton />,
    ssr: false,
  }
);

const MONTHS = [
  { value: 0, label: "Januari" },
  { value: 1, label: "Februari" },
  { value: 2, label: "Maret" },
  { value: 3, label: "April" },
  { value: 4, label: "Mei" },
  { value: 5, label: "Juni" },
  { value: 6, label: "Juli" },
  { value: 7, label: "Agustus" },
  { value: 8, label: "September" },
  { value: 9, label: "Oktober" },
  { value: 10, label: "November" },
  { value: 11, label: "Desember" },
];

const YEARS = [2024, 2025, 2026, 2027];

function ChartSkeleton({ h = "h-72" }: { h?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-5 w-8" />
      </div>
      <Skeleton className={`w-full ${h}`} />
    </div>
  );
}

function TransactionListSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

function WidgetSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <div className="space-y-5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 space-y-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-5 w-1/2" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-14 sm:h-16 rounded-xl" />
        <Skeleton className="h-14 sm:h-16 rounded-xl" />
        <Skeleton className="h-14 sm:h-16 rounded-xl" />
      </div>
      <div className="space-y-1.5 mt-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-11 rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-11 rounded-xl" />
      </div>
      <Skeleton className="h-11 rounded-xl mt-4" />
    </div>
  );
}

function BankAccountsSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Skeleton className="h-24 sm:h-28 rounded-2xl" />
        <Skeleton className="h-24 sm:h-28 rounded-2xl" />
      </div>
    </div>
  );
}

type TabType = "stats" | "wallet" | "plans";

interface DashboardClientProps {
  summary: FinancialSummary;
  monthlyData: MonthlyData[];
  categoryExpenses: CategoryExpense[];
  insights: Insight[];
  transactions: TransactionRow[];
  bankAccounts: BankAccountRow[];
  availableCategories: AvailableTransactionCategories;
  budgetItems: BudgetItemRow[];
  savingsGoals: SavingsGoalRow[];
  upcomingBills: UpcomingBillRow[];
  currentMonth: number;
  currentYear: number;
  recentNotifications: TransactionRow[];
}

export function DashboardClient({
  summary,
  monthlyData,
  categoryExpenses,
  insights,
  transactions,
  bankAccounts,
  availableCategories,
  budgetItems,
  savingsGoals,
  upcomingBills,
  currentMonth,
  currentYear,
  recentNotifications,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("stats");
  const [isMounted, setIsMounted] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const router = useRouter();

  // Pastikan waktu footer dieksekusi hanya di client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fitur Notifikasi Budget Lokal (Hanya jalan sekali per sesi)
  useEffect(() => {
    if (!isMounted) return;

    const checkBudgetNotification = async () => {
      if (!("Notification" in window) || sessionStorage.getItem("budget_notif_sent")) return;

      const overBudgetItems = budgetItems.filter(
        (b) => b.limit > 0 && (b.spent / b.limit) > 0.8
      );

      if (overBudgetItems.length > 0) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          new Notification("Peringatan Anggaran!", {
            body: `Hati-hati! ${overBudgetItems.length} kategori anggaran Anda (seperti ${overBudgetItems[0].category}) sudah terpakai lebih dari 80%.`,
            icon: "/icon512_maskable.png",
          });
          sessionStorage.setItem("budget_notif_sent", "true");
        }
      }
    };

    const timer = setTimeout(checkBudgetNotification, 2000);
    return () => clearTimeout(timer);
  }, [budgetItems, isMounted]);

  const tabs = [
    { id: "stats", label: "Analisis", icon: <TrendingUp className="h-4 w-4" /> },
    { id: "wallet", label: "Transaksi", icon: <Wallet className="h-4 w-4" /> },
    { id: "plans", label: "Target", icon: <Target className="h-4 w-4" /> },
  ] as const;

  // Fungsi untuk update query params URL saat dropdown diganti
  const handlePeriodChange = (month: number, year: number) => {
    startTransition(() => {
      router.push(`/dashboard?month=${month}&year=${year}`);
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    // Minimum swipe distance
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped left -> next month
        let nextMonth = currentMonth + 1;
        let nextYear = currentYear;
        if (nextMonth > 11) {
          nextMonth = 0;
          nextYear += 1;
        }
        if (nextYear <= YEARS[YEARS.length - 1]) {
          handlePeriodChange(nextMonth, nextYear);
        }
      } else {
        // Swiped right -> prev month
        let prevMonth = currentMonth - 1;
        let prevYear = currentYear;
        if (prevMonth < 0) {
          prevMonth = 11;
          prevYear -= 1;
        }
        if (prevYear >= YEARS[0]) {
          handlePeriodChange(prevMonth, prevYear);
        }
      }
    }
    setTouchStartX(null);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <DashboardHeader bankAccounts={bankAccounts} availableCategories={availableCategories} recentNotifications={recentNotifications} />

      <main className="mx-auto max-w-screen-xl px-4 py-5 sm:px-6 lg:px-8">

        {/* ── Filter Multi-Month Dropdown ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/80 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/40 hover:shadow-md select-none"
        >
          <div className="flex items-center gap-4">
            <motion.div
              className="relative rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 p-3 text-emerald-500 shadow-inner"
            >
              <Calendar className="h-5 w-5" />
              {/* Efek denyut halus di belakang ikon kalender */}
              <span className="absolute inset-0 rounded-xl bg-emerald-500/20 animate-ping opacity-20 pointer-events-none" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold tracking-wider uppercase text-[var(--muted-foreground)]">
                Periode Laporan
              </span>
              <span className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[var(--foreground)] to-[var(--muted-foreground)] tracking-tight">
                {MONTHS[currentMonth].label} {currentYear}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:w-auto w-full">
            {/* Selector Bulan Menggunakan UI Component */}
            <div className="flex-1 sm:flex-initial min-w-[130px]">
              <Select
                value={String(currentMonth)}
                onValueChange={(val) => handlePeriodChange(Number(val), currentYear)}
              >
                <SelectTrigger className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)]/50 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-[var(--foreground)] outline-none transition-all duration-200 hover:bg-[var(--muted)] hover:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20 shadow-sm">
                  <SelectValue placeholder="Pilih Bulan" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[var(--card-border)] bg-[var(--card)]/90 backdrop-blur-xl shadow-2xl max-h-[240px]">
                  {MONTHS.map((m) => (
                    <SelectItem
                      key={m.value}
                      value={String(m.value)}
                      className="text-xs font-semibold rounded-lg cursor-pointer transition-colors focus:bg-emerald-500/15 focus:text-emerald-500"
                    >
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selector Tahun Menggunakan UI Component */}
            <div className="flex-1 sm:flex-initial min-w-[100px]">
              <Select
                value={String(currentYear)}
                onValueChange={(val) => handlePeriodChange(currentMonth, Number(val))}
              >
                <SelectTrigger className="w-full rounded-xl border border-[var(--card-border)] bg-[var(--background)]/50 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-[var(--foreground)] outline-none transition-all duration-200 hover:bg-[var(--muted)] hover:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/20 shadow-sm">
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[var(--card-border)] bg-[var(--card)]/90 backdrop-blur-xl shadow-2xl">
                  {YEARS.map((y) => (
                    <SelectItem
                      key={y}
                      value={String(y)}
                      className="text-xs font-semibold rounded-lg cursor-pointer transition-colors focus:bg-emerald-500/15 focus:text-emerald-500"
                    >
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* ── Financial Overview cards ─────────────────────── */}
        <section className="mb-5">
          <FinancialOverview summary={summary} />
        </section>

        {/* ── Mobile Tab Navigation (lg:hidden) ────────────────── */}
        <div className="mb-5 lg:hidden">
          <div className="flex rounded-2xl bg-[var(--card)] border border-[var(--card-border)] p-1.5 shadow-sm">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex flex-1 items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-colors duration-150 cursor-pointer select-none"
                  style={{
                    color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                  }}
                >
                  {/* Sliding background */}
                  {isActive && (
                    <motion.div
                      layoutId="dashboard-active-tab-bg"
                      className="absolute inset-0 rounded-xl bg-[var(--muted)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {tab.icon}
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Desktop double-column layout ───────────────────────── */}
        <div className="hidden lg:grid gap-5 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px]">
          {/* Left Column: main content */}
          <div className="flex flex-col gap-5 min-w-0">
            <CashflowChart data={monthlyData} />

            <div className="grid gap-5 md:grid-cols-2">
              <ExpenseChart data={categoryExpenses} />
              <FinancialInsights initialInsights={insights} month={currentMonth} year={currentYear} />
            </div>

            <RecentTransactions transactions={transactions} bankAccounts={bankAccounts} availableCategories={availableCategories} />
          </div>

          {/* Right Column: sidebar widgets */}
          <div className="flex flex-col gap-5">
            <QuickTransactionForm bankAccounts={bankAccounts} availableCategories={availableCategories} />
            <BankAccountsWidget accounts={bankAccounts} />
            <BudgetProgress budgetItems={budgetItems} availableCategories={availableCategories} />
            <GoalsTracker goals={savingsGoals} />
            <UpcomingBills bills={upcomingBills} />
          </div>
        </div>

        {/* ── Mobile Tab Content (lg:hidden) ────────────────────── */}
        <div className="lg:hidden">
          <AnimatePresence mode="wait">
            {activeTab === "stats" && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex flex-col gap-5"
              >
                <CashflowChart data={monthlyData} />
                <BankAccountsWidget accounts={bankAccounts} />
                <ExpenseChart data={categoryExpenses} />
                <FinancialInsights initialInsights={insights} month={currentMonth} year={currentYear} />
              </motion.div>
            )}

            {activeTab === "wallet" && (
              <motion.div
                key="wallet"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex flex-col gap-5"
              >
                <QuickTransactionForm bankAccounts={bankAccounts} availableCategories={availableCategories} />
                <RecentTransactions transactions={transactions} bankAccounts={bankAccounts} availableCategories={availableCategories} />
              </motion.div>
            )}

            {activeTab === "plans" && (
              <motion.div
                key="plans"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="flex flex-col gap-5"
              >
                <BudgetProgress budgetItems={budgetItems} availableCategories={availableCategories} />
                <GoalsTracker goals={savingsGoals} />
                <UpcomingBills bills={upcomingBills} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sync footer */}
        <footer className="mt-8 flex items-center justify-center gap-2 text-xs text-[var(--muted-foreground)]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Data tersinkronisasi ·{" "}
          {isMounted
            ? new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
            : "--:--"
          }
        </footer>
      </main>
    </div>
  );
}
