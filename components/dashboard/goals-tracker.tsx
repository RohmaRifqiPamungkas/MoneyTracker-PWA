"use client";

import { motion } from "framer-motion";
import { Flag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type { SavingsGoalRow } from "@/lib/supabase/types";

export function GoalsTracker({ goals }: { goals: SavingsGoalRow[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="shadow-sm border-[var(--card-border)]">
        <CardHeader className="p-4 sm:p-6 pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Flag className="h-4 w-4 text-emerald-500" />
            Target Tabungan
          </CardTitle>
          <CardDescription className="text-xs">Progres menuju tujuan keuanganmu</CardDescription>
        </CardHeader>

        <CardContent className="pt-0 pb-4">
          <div className="flex flex-col gap-1">
            {goals.map((goal, i) => {
              const pct = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);
              const done = pct >= 100;

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i, duration: 0.3 }}
                  className={cn(
                    "py-3 flex flex-col gap-2",
                    i < goals.length - 1 && "border-b border-[var(--card-border)]/50"
                  )}
                >
                  {/* Row 1: Emoji + Nama + Tanggal Target di Kiri | Persentase di Kanan */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg leading-none select-none shrink-0">{goal.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--foreground)] truncate leading-tight">
                          {goal.name}
                        </p>
                        <p className="text-[11px] text-[var(--muted-foreground)] leading-tight mt-1">
                          Target &bull; {formatDate(goal.target_date, "MMM yyyy")}
                        </p>
                      </div>
                    </div>

                    {/* Persentase ditaruh di atas kanan agar simetris */}
                    <div className="shrink-0 ml-auto">
                      <span className={cn(
                        "text-xs sm:text-sm font-bold tabular-nums w-8 text-right block",
                        done ? "text-emerald-500" : "text-[var(--foreground)]"
                      )}>
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Progress bar */}
                  <Progress
                    value={pct}
                    indicatorColor={done ? "#10b981" : "#34d399"}
                    className="h-1.5 rounded-full"
                  />

                  {/* Row 3: Detail Angka Nominal (Dipindah ke bawah agar lapang & clean di mobile) */}
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[var(--muted-foreground)] tabular-nums font-medium">
                    <span>
                      Terkumpul: {formatCurrency(goal.current_amount, true)}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="opacity-50">dari</span> 
                      <span className="text-[var(--foreground)] font-semibold">{formatCurrency(goal.target_amount, true)}</span>
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}