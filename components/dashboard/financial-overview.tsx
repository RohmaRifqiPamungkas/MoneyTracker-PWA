"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, PiggyBank, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getTrendBg } from "@/lib/utils";
import { FINANCIAL_SUMMARY } from "@/lib/mock-data";

interface SummaryCardProps {
  title: string;
  value: number;
  growth: number;
  subtitle?: string;
  icon: React.ReactNode;
  accentColor: string;
  delay?: number;
}

function SummaryCard({ title, value, growth, subtitle, icon, accentColor, delay = 0 }: SummaryCardProps) {
  const isPositive = growth >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      <Card className="group relative overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
        {/* Accent glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
          style={{
            background: `radial-gradient(circle at 80% 20%, ${accentColor}15 0%, transparent 60%)`,
          }}
        />

        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between mb-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${accentColor}18` }}
            >
              <span style={{ color: accentColor }}>{icon}</span>
            </div>
            <Badge className={getTrendBg(growth)}>
              {isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(growth)}%
            </Badge>
          </div>

          <p className="text-sm text-[var(--muted-foreground)] mb-1">{title}</p>
          <p className="text-xl font-bold text-[var(--foreground)] tracking-tight">
            {formatCurrency(value, true)}
          </p>
          {subtitle && (
            <p className="text-xs text-[var(--muted-foreground)] mt-1">{subtitle}</p>
          )}

          {/* Mini trend bar */}
          <div className="mt-3 h-1 w-full rounded-full bg-[var(--muted)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, Math.abs(growth) * 5 + 40)}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function FinancialOverview() {
  const { totalBalance, totalIncome, totalExpenses, totalSavings, balanceGrowth, incomeGrowth, expenseGrowth, savingsRate } =
    FINANCIAL_SUMMARY;

  const cards = [
    {
      title: "Total Saldo",
      value: totalBalance,
      growth: balanceGrowth,
      subtitle: "vs. bulan lalu",
      icon: <Wallet className="h-5 w-5" />,
      accentColor: "#10b981",
    },
    {
      title: "Total Pemasukan",
      value: totalIncome,
      growth: incomeGrowth,
      subtitle: "bulan ini",
      icon: <TrendingUp className="h-5 w-5" />,
      accentColor: "#6366f1",
    },
    {
      title: "Total Pengeluaran",
      value: totalExpenses,
      growth: expenseGrowth,
      subtitle: "bulan ini",
      icon: <TrendingDown className="h-5 w-5" />,
      accentColor: "#f43f5e",
    },
    {
      title: "Total Tabungan",
      value: totalSavings,
      growth: savingsRate,
      subtitle: `Rasio tabungan ${savingsRate}%`,
      icon: <PiggyBank className="h-5 w-5" />,
      accentColor: "#f59e0b",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {cards.map((card, i) => (
        <SummaryCard key={card.title} {...card} delay={i * 0.08} />
      ))}
    </div>
  );
}
