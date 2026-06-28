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
import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton({ h = "h-48" }: { h?: string }) {
  return (
    <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5">
      <Skeleton className={`w-full ${h}`} />
    </div>
  );
}

type TabType = "stats" | "wallet" | "plans";

export default function DashboardPage() {
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
          <Suspense
            fallback={
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <CardSkeleton key={i} h="h-28" />
                ))}
              </div>
            }
          >
            <FinancialOverview />
          </Suspense>
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
            <Suspense fallback={<CardSkeleton h="h-64" />}>
              <CashflowChart />
            </Suspense>

            <div className="grid gap-5 md:grid-cols-2">
              <Suspense fallback={<CardSkeleton h="h-72" />}>
                <ExpenseChart />
              </Suspense>
              <Suspense fallback={<CardSkeleton h="h-72" />}>
                <FinancialInsights />
              </Suspense>
            </div>

            <Suspense fallback={<CardSkeleton h="h-80" />}>
              <RecentTransactions />
            </Suspense>
          </div>

          {/* Right Column: sidebar widgets */}
          <div className="flex flex-col gap-5">
            <Suspense fallback={<CardSkeleton h="h-96" />}>
              <BankAccountsWidget />
            </Suspense>

            <Suspense fallback={<CardSkeleton h="h-64" />}>
              <BudgetProgress />
            </Suspense>

            <Suspense fallback={<CardSkeleton h="h-64" />}>
              <GoalsTracker />
            </Suspense>

            <Suspense fallback={<CardSkeleton h="h-64" />}>
              <UpcomingBills />
            </Suspense>
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
                <Suspense fallback={<CardSkeleton h="h-64" />}>
                  <CashflowChart />
                </Suspense>
                <Suspense fallback={<CardSkeleton h="h-72" />}>
                  <ExpenseChart />
                </Suspense>
                <Suspense fallback={<CardSkeleton h="h-72" />}>
                  <FinancialInsights />
                </Suspense>
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
                <Suspense fallback={<CardSkeleton h="h-96" />}>
                  <BankAccountsWidget />
                </Suspense>
                <Suspense fallback={<CardSkeleton h="h-80" />}>
                  <RecentTransactions />
                </Suspense>
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
                <Suspense fallback={<CardSkeleton h="h-64" />}>
                  <BudgetProgress />
                </Suspense>
                <Suspense fallback={<CardSkeleton h="h-64" />}>
                  <GoalsTracker />
                </Suspense>
                <Suspense fallback={<CardSkeleton h="h-64" />}>
                  <UpcomingBills />
                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sync footer */}
        <footer className="mt-8 flex items-center justify-center gap-2 text-xs text-[var(--muted-foreground)]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Data disinkronkan ·{" "}
          {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
        </footer>
      </main>
    </div>
  );
}
