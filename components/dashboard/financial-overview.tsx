"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, PiggyBank } from "lucide-react";
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
  delay?: number;
}

function SummaryCard({ title, value, growth, subtitle, icon, accentColor, delay = 0 }: SummaryCardProps) {
  const isPositive = growth >= 0;

  // State untuk memastikan text dimuat dengan aman di sisi client
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
      <Card className="relative overflow-hidden group">
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

        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1.5">
              <p className="text-[13px] font-medium text-[var(--muted-foreground)] tracking-wide">
                {title}
              </p>

              {/* PERUBAHAN UTAMA: Tunda konversi mata uang sampai selesai mounting ke browser */}
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--foreground)] tabular-nums tracking-tight">
                {isMounted ? formatCurrency(value) : "Rp0"}
              </h3>

            </div>
            <div
              className="p-2.5 rounded-xl shadow-sm border border-[var(--card-border)] bg-[var(--card)] relative overflow-hidden"
              style={{ color: accentColor }}
            >
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{ backgroundColor: accentColor }}
              />
              {icon}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`px-1.5 py-0 border-transparent shadow-none font-semibold ${getTrendBg(growth)}`}
            >
              <span className="flex items-center gap-0.5 text-xs">
                {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(growth)}%
              </span>
            </Badge>
            {subtitle && (
              <span className="text-[11px] text-[var(--muted-foreground)]">
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
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      <SummaryCard
        title="Total Saldo"
        value={summary.totalBalance}
        growth={summary.balanceGrowth}
        subtitle="vs. bulan lalu"
        icon={<Wallet className="h-5 w-5" />}
        accentColor="#10b981"
        delay={0}
      />
      <SummaryCard
        title="Pemasukan"
        value={summary.totalIncome}
        growth={summary.incomeGrowth}
        subtitle="bulan ini"
        icon={<TrendingUp className="h-5 w-5" />}
        accentColor="#6366f1"
        delay={0.08}
      />
      <SummaryCard
        title="Pengeluaran"
        value={summary.totalExpenses}
        growth={summary.expenseGrowth}
        subtitle="bulan ini"
        icon={<TrendingDown className="h-5 w-5" />}
        accentColor="#f43f5e"
        delay={0.16}
      />
      <SummaryCard
        title="Total Tabungan"
        value={summary.totalSavings}
        growth={summary.savingsRate}
        subtitle={`Rasio tabungan ${summary.savingsRate}%`}
        icon={<PiggyBank className="h-5 w-5" />}
        accentColor="#f59e0b"
        delay={0.24}
      />
    </div>
  );
}