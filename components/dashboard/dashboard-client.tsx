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
    loading: () => <Skeleton className="h-72 w-full rounded-2xl" />,
    ssr: false,
  }
);

const ExpenseChart = dynamic(
  () => import("@/components/dashboard/expense-chart").then((m) => m.ExpenseChart),
  {
    loading: () => <Skeleton className="h-64 w-full rounded-2xl" />,
    ssr: false,
  }
);

const FinancialInsights = dynamic(
  () => import("@/components/dashboard/financial-insights").then((m) => m.FinancialInsights),
  {
    loading: () => <Skeleton className="h-64 w-full rounded-2xl" />,
    ssr: false,
  }
);

const RecentTransactions = dynamic(
  () => import("@/components/dashboard/recent-transactions").then((m) => m.RecentTransactions),
  {
    loading: () => <Skeleton className="h-80 w-full rounded-2xl" />,
    ssr: false,
  }
);

const BudgetProgress = dynamic(
  () => import("@/components/dashboard/budget-progress").then((m) => m.BudgetProgress),
  {
    loading: () => <Skeleton className="h-48 w-full rounded-2xl" />,
    ssr: false,
  }
);

const GoalsTracker = dynamic(
  () => import("@/components/dashboard/goals-tracker").then((m) => m.GoalsTracker),
  {
    loading: () => <Skeleton className="h-32 w-full rounded-2xl" />,
    ssr: false,
  }
);

const UpcomingBills = dynamic(
  () => import("@/components/dashboard/upcoming-bills").then((m) => m.UpcomingBills),
  {
    loading: () => <Skeleton className="h-32 w-full rounded-2xl" />,
    ssr: false,
  }
);

const QuickTransactionForm = dynamic(
  () => import("@/components/dashboard/quick-transaction-form").then((m) => m.QuickTransactionForm),
  {
    loading: () => <Skeleton className="h-48 w-full rounded-2xl" />,
    ssr: false,
  }
);

const BankAccountsWidget = dynamic(
  () => import("@/components/dashboard/bank-accounts").then((m) => m.BankAccountsWidget),
  {
    loading: () => <Skeleton className="h-32 w-full rounded-2xl" />,
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

function CardSkeleton({ h = "h-48" }: { h?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
      <Skeleton className={`w-full ${h}`} />
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
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("stats");
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Pastikan waktu footer dieksekusi hanya di client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <DashboardHeader bankAccounts={bankAccounts} availableCategories={availableCategories} />

      <main className="mx-auto max-w-screen-xl px-4 py-5 sm:px-6 lg:px-8">

        {/* ── Filter Multi-Month Dropdown ───────────────────────── */}
        {/* ── Filter Multi-Month Dropdown (Interactive Version) ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-4 shadow-sm backdrop-blur-md transition-all duration-200 hover:border-emerald-500/20"
        >
          <div className="flex items-center gap-3">
            <div className="relative rounded-xl bg-emerald-500/10 p-2.5 text-emerald-500 transition-transform duration-300 hover:scale-105">
              <Calendar className="h-5 w-5" />
              {/* Efek denyut halus di belakang ikon kalender */}
              <span className="absolute inset-0 rounded-xl bg-emerald-500/20 animate-ping opacity-20 pointer-events-none" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium tracking-wider uppercase text-[var(--muted-foreground)]">
                Periode Laporan
              </span>
              <span className="text-base font-bold text-[var(--foreground)] tracking-tight">
                {MONTHS[currentMonth].label} {currentYear}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:w-auto w-full">
            {/* Selector Bulan Menggunakan UI Component */}
            <div className="flex-1 sm:flex-initial min-w-[120px]">
              <Select
                value={String(currentMonth)}
                onValueChange={(val) => handlePeriodChange(Number(val), currentYear)}
              >
                <SelectTrigger className="w-full rounded-xl border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] outline-none transition-all duration-150 hover:bg-[var(--muted)] focus:ring-2 focus:ring-emerald-500/30">
                  <SelectValue placeholder="Pilih Bulan" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[var(--card-border)] bg-[var(--card)] shadow-xl max-h-[240px]">
                  {MONTHS.map((m) => (
                    <SelectItem
                      key={m.value}
                      value={String(m.value)}
                      className="text-xs font-medium rounded-lg cursor-pointer transition-colors focus:bg-emerald-500/10 focus:text-emerald-500"
                    >
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selector Tahun Menggunakan UI Component */}
            <div className="flex-1 sm:flex-initial min-w-[90px]">
              <Select
                value={String(currentYear)}
                onValueChange={(val) => handlePeriodChange(currentMonth, Number(val))}
              >
                <SelectTrigger className="w-full rounded-xl border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] outline-none transition-all duration-150 hover:bg-[var(--muted)] focus:ring-2 focus:ring-emerald-500/30">
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[var(--card-border)] bg-[var(--card)] shadow-xl">
                  {YEARS.map((y) => (
                    <SelectItem
                      key={y}
                      value={String(y)}
                      className="text-xs font-medium rounded-lg cursor-pointer transition-colors focus:bg-emerald-500/10 focus:text-emerald-500"
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
              <FinancialInsights insights={insights} />
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5"
              >
                <CashflowChart data={monthlyData} />
                <ExpenseChart data={categoryExpenses} />
                <FinancialInsights insights={insights} />
              </motion.div>
            )}

            {activeTab === "wallet" && (
              <motion.div
                key="wallet"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5"
              >
                <QuickTransactionForm bankAccounts={bankAccounts} availableCategories={availableCategories} />
                <BankAccountsWidget accounts={bankAccounts} />
                <RecentTransactions transactions={transactions} bankAccounts={bankAccounts} availableCategories={availableCategories} />
              </motion.div>
            )}

            {activeTab === "plans" && (
              <motion.div
                key="plans"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
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
