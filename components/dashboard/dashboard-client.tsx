"use client";

import { Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Wallet, Target } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FinancialOverview } from "@/components/dashboard/financial-overview";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { BudgetProgress } from "@/components/dashboard/budget-progress";
import { FinancialInsights } from "@/components/dashboard/financial-insights";
import { GoalsTracker } from "@/components/dashboard/goals-tracker";
import { UpcomingBills } from "@/components/dashboard/upcoming-bills";
import { BankAccountsWidget } from "@/components/dashboard/bank-accounts";
import { QuickTransactionForm } from "@/components/dashboard/quick-transaction-form";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  TransactionRow,
  BankAccountRow,
  BudgetItemRow,
  SavingsGoalRow,
  UpcomingBillRow,
} from "@/lib/supabase/types";
import type { MonthlyData, CategoryExpense, Insight, FinancialSummary } from "@/lib/types";

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
  budgetItems: BudgetItemRow[];
  savingsGoals: SavingsGoalRow[];
  upcomingBills: UpcomingBillRow[];
}

export function DashboardClient({
  summary,
  monthlyData,
  categoryExpenses,
  insights,
  transactions,
  bankAccounts,
  budgetItems,
  savingsGoals,
  upcomingBills,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("stats");

  const tabs = [
    { id: "stats", label: "Analisis", icon: <TrendingUp className="h-4 w-4" /> },
    { id: "wallet", label: "Transaksi", icon: <Wallet className="h-4 w-4" /> },
    { id: "plans", label: "Target", icon: <Target className="h-4 w-4" /> },
  ] as const;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <DashboardHeader />

      <main className="mx-auto max-w-screen-xl px-4 py-5 sm:px-6 lg:px-8">
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
        {/* Visible on lg+ viewports, completely hidden on mobile/tablet */}
        <div className="hidden lg:grid gap-5 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_360px]">
          {/* Left Column: main content */}
          <div className="flex flex-col gap-5 min-w-0">
            <CashflowChart data={monthlyData} />

            <div className="grid gap-5 md:grid-cols-2">
              <ExpenseChart data={categoryExpenses} />
              <FinancialInsights insights={insights} />
            </div>

            <RecentTransactions transactions={transactions} bankAccounts={bankAccounts} />
          </div>

          {/* Right Column: sidebar widgets */}
          <div className="flex flex-col gap-5">
            <QuickTransactionForm bankAccounts={bankAccounts} />
            <BankAccountsWidget accounts={bankAccounts} />
            <BudgetProgress budgetItems={budgetItems} />
            <GoalsTracker goals={savingsGoals} />
            <UpcomingBills bills={upcomingBills} />
          </div>
        </div>

        {/* ── Mobile Tab Content (lg:hidden) ────────────────────── */}
        {/* Animated dynamic tabs for small viewports */}
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
                <QuickTransactionForm bankAccounts={bankAccounts} />
                <BankAccountsWidget accounts={bankAccounts} />
                <RecentTransactions transactions={transactions} bankAccounts={bankAccounts} />
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
                <BudgetProgress budgetItems={budgetItems} />
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
          {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
        </footer>
      </main>
    </div>
  );
}
