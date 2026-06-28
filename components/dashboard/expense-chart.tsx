"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CATEGORY_EXPENSES } from "@/lib/mock-data";
import { formatCurrency, cn } from "@/lib/utils";

export function ExpenseChart() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const total = CATEGORY_EXPENSES.reduce((s, c) => s + c.amount, 0);

  const active = activeIdx !== null ? CATEGORY_EXPENSES[activeIdx] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">Distribusi Pengeluaran</CardTitle>
          <CardDescription className="text-xs">
            Breakdown per kategori · Total {formatCurrency(total, true)}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          {/* Donut + center label */}
          <div className="relative h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_EXPENSES}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={82}
                  dataKey="amount"
                  paddingAngle={2}
                  onMouseEnter={(_, i) => setActiveIdx(i)}
                  onMouseLeave={() => setActiveIdx(null)}
                  animationBegin={200}
                  animationDuration={900}
                >
                  {CATEGORY_EXPENSES.map((entry, i) => (
                    <Cell
                      key={entry.category}
                      fill={entry.color}
                      opacity={activeIdx === null || activeIdx === i ? 1 : 0.4}
                      stroke="transparent"
                      style={{
                        transform: activeIdx === i ? "scale(1.05)" : "scale(1)",
                        transformOrigin: "center",
                        transition: "opacity 0.15s, transform 0.15s",
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center text overlay */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              {active ? (
                <>
                  <p className="text-sm font-semibold text-[var(--foreground)]">{active.label}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{formatCurrency(active.amount, true)}</p>
                  <p className="text-sm font-bold" style={{ color: active.color }}>
                    {active.percentage}%
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs text-[var(--muted-foreground)]">Total</p>
                  <p className="text-base font-bold text-[var(--foreground)]">{formatCurrency(total, true)}</p>
                </>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 grid grid-cols-2 gap-1">
            {CATEGORY_EXPENSES.map((entry, i) => (
              <button
                key={entry.category}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors",
                  activeIdx === i ? "bg-[var(--muted)]" : "hover:bg-[var(--muted)]/50"
                )}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="truncate text-[var(--muted-foreground)]">{entry.label}</span>
                <span className="ml-auto font-semibold text-[var(--foreground)] shrink-0">
                  {entry.percentage}%
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
