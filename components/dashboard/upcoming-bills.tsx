"use client";

import { motion } from "framer-motion";
import { CalendarClock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, daysUntil, cn } from "@/lib/utils";
import type { UpcomingBillRow } from "@/lib/supabase/types";

export function UpcomingBills({ bills }: { bills: UpcomingBillRow[] }) {
  const billsWithDays = bills.map((bill) => ({
    ...bill,
    daysLeft: daysUntil(bill.due_date),
  })).sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
    >
      <Card className="shadow-sm border-[var(--card-border)]">
        <CardHeader className="p-4 sm:p-6 pb-3">
          <div className="flex items-center gap-2.5">
            {/* Icon Bubble wrapper agar konsisten dengan widget lainnya */}
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
              <CalendarClock className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-semibold text-[var(--foreground)]">
                Tagihan Mendatang
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs mt-0.5">
                {billsWithDays.filter((b) => b.daysLeft <= 7).length} tagihan jatuh tempo dalam 7 hari
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 pt-0 space-y-2">
          {billsWithDays.map((bill, i) => {
            const isUrgent = bill.daysLeft <= 3;
            const isWarning = bill.daysLeft <= 7 && bill.daysLeft > 3;

            return (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.3 }}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-xl p-3 border border-[var(--card-border)] bg-[var(--card)] transition-all active:scale-[0.99]",
                  isUrgent
                    ? "border-l-4 border-l-rose-500"
                    : isWarning
                      ? "border-l-4 border-l-amber-500"
                      : "border-l-4 border-l-transparent md:hover:bg-[var(--muted)]/50"
                )}
              >
                {/* Bagian Kiri: Emoji + Teks Utama */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Emoji icon bubble */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--muted)]/70 text-base shadow-sm border border-[var(--card-border)]/10">
                    {bill.emoji}
                  </div>

                  {/* Info details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs sm:text-sm font-semibold text-[var(--foreground)] truncate leading-tight">
                        {bill.name}
                      </p>
                      {isUrgent && <AlertTriangle className="h-3 w-3 text-rose-500 shrink-0" />}
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] mt-1 font-medium truncate">
                      Tempo: {formatDate(bill.due_date)}
                    </p>
                  </div>
                </div>

                {/* Bagian Kanan: Nominal + Badge Status Hari */}
                <div className="flex flex-col items-end gap-1.5 shrink-0 text-right pl-1">
                  <span className="text-xs sm:text-sm font-bold text-[var(--foreground)] tabular-nums tracking-tight">
                    {formatCurrency(bill.amount, true)}
                  </span>
                  <Badge
                    variant={isUrgent ? "destructive" : isWarning ? "warning" : "secondary"}
                    className="text-[9px] sm:text-[10px] px-1.5 py-0.5 font-semibold tracking-wide border-none shadow-none"
                  >
                    {bill.daysLeft === 0
                      ? "Hari ini!"
                      : bill.daysLeft < 0
                        ? "Terlambat!"
                        : `${bill.daysLeft}h lagi`}
                  </Badge>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}