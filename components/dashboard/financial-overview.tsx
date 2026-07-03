"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, PiggyBank, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getTrendBg } from "@/lib/utils";
import type { FinancialSummary } from "@/lib/types";

interface SummaryCardProps {
  title: string;
  value: number;
  growth: number;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor: string;
  action?: React.ReactNode;
  hidden?: boolean;
  delay?: number;
}

function SummaryCard({ title, value, growth, subtitle, icon, accentColor, action, hidden = false, delay = 0 }: SummaryCardProps) {
  const isPositive = growth >= 0;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="relative overflow-hidden group h-full">
        {/* Subtle accent line on top */}
        <div
          className="absolute top-0 left-0 right-0 h-1 opacity-80"
          style={{ backgroundColor: accentColor }}
        />

        {/* Hover subtle glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at top right, ${accentColor}, transparent 70%)`
          }}
        />

        <CardContent className="p-3.5 sm:p-5 flex flex-col justify-between h-full">
          <div>
            {/* Header: Judul + Icon */}
            <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
              <p className="text-[11px] sm:text-[13px] font-medium text-[var(--muted-foreground)] tracking-wide truncate">
                {title}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                {action}
                <div
                  className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl border border-[var(--card-border)] bg-[var(--card)] relative overflow-hidden shrink-0"
                  style={{ color: accentColor }}
                >
                  <div
                    className="absolute inset-0 opacity-[0.08]"
                    style={{ backgroundColor: accentColor }}
                  />
                  {/* Menyesuaikan ukuran icon di mobile */}
                  <div className="h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center [&>svg]:h-full [&>svg]:w-full">
                    {icon}
                  </div>
                </div>
              </div>
            </div>

            {/* Value / Nominal */}
            <h3 className="text-base sm:text-2xl font-bold text-[var(--foreground)] tabular-nums tracking-tight break-all sm:break-normal line-clamp-1">
              {hidden ? "Rp ••••••" : isMounted ? formatCurrency(value) : "Rp0"}
            </h3>
          </div>

          {/* Footer: Trend Badge & Subtitle */}
          <div className="flex flex-col xs:flex-row xs:items-center gap-1.5 sm:gap-2 mt-3 pt-2 border-t border-[var(--card-border)]/20 sm:border-none">
            <Badge
              variant="outline"
              className={`px-1.5 py-0.5 border-transparent shadow-none font-semibold w-fit shrink-0 ${getTrendBg(growth)}`}
            >
              <span className="flex items-center gap-0.5 text-[10px] sm:text-xs">
                {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(growth)}%
              </span>
            </Badge>
            {subtitle && (
              <span className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] truncate">
                {subtitle}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function FinancialOverview({ summary }: { summary: FinancialSummary }) {
  const [hidden, setHidden] = useState(false);

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
        <SummaryCard
          title="Total Saldo"
          value={summary.totalBalance}
          growth={summary.balanceGrowth}
          subtitle="vs. bulan lalu"
          icon={<Wallet />}
          accentColor="#10b981"
          action={(
            <button
              onClick={() => setHidden((value) => !value)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--card-border)] bg-[var(--card)]/70 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              aria-label={hidden ? "Tampilkan saldo ringkasan" : "Sembunyikan saldo ringkasan"}
            >
              {hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            </button>
          )}
          hidden={hidden}
          delay={0}
        />
        <SummaryCard
          title="Pemasukan"
          value={summary.totalIncome}
          growth={summary.incomeGrowth}
          subtitle="bulan ini"
          icon={<TrendingUp />}
          accentColor="#6366f1"
          hidden={hidden}
          delay={0.04}
        />
        <SummaryCard
          title="Pengeluaran"
          value={summary.totalExpenses}
          growth={summary.expenseGrowth}
          subtitle="bulan ini"
          icon={<TrendingDown />}
          accentColor="#f43f5e"
          hidden={hidden}
          delay={0.08}
        />
        <SummaryCard
          title="Total Tabungan"
          value={summary.totalSavings}
          growth={summary.savingsRate}
          subtitle={`Rasio: ${summary.savingsRate}%`}
          icon={<PiggyBank />}
          accentColor="#f59e0b"
          hidden={hidden}
          delay={0.12}
        />
    </div>
  );
}
