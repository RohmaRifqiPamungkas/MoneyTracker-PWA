"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MONTHLY_DATA } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 shadow-lg">
      <p className="mb-2 text-xs font-semibold text-[var(--muted-foreground)]">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[var(--muted-foreground)] capitalize">
            {entry.name === "income" ? "Pemasukan" : "Pengeluaran"}:
          </span>
          <span className="font-semibold text-[var(--foreground)]">
            {formatCurrency(entry.value, true)}
          </span>
        </div>
      ))}
      {payload.length === 2 && (
        <div className="mt-2 border-t border-[var(--card-border)] pt-2 flex items-center gap-2 text-sm">
          <span className="text-[var(--muted-foreground)]">Selisih:</span>
          <span
            className="font-semibold"
            style={{
              color: payload[0].value >= payload[1].value ? "#10b981" : "#f43f5e",
            }}
          >
            {formatCurrency(Math.abs(payload[0].value - payload[1].value), true)}
          </span>
        </div>
      )}
    </div>
  );
}

export function CashflowChart() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-base">Arus Kas Bulanan</CardTitle>
              <CardDescription className="mt-0.5 text-xs">
                Perbandingan pemasukan dan pengeluaran Jan – Des 2026
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[var(--muted-foreground)]">Pemasukan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                <span className="text-[var(--muted-foreground)]">Pengeluaran</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 pb-2">
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={MONTHLY_DATA}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--card-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}jt`}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "var(--card-border)", strokeWidth: 1, strokeDasharray: "4 2" }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#incomeGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#10b981", strokeWidth: 2, stroke: "var(--card)" }}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fill="url(#expenseGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#f43f5e", strokeWidth: 2, stroke: "var(--card)" }}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
