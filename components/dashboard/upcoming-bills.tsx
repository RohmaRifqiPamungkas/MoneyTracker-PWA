"use client";

import { motion } from "framer-motion";
import { CalendarClock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UPCOMING_BILLS } from "@/lib/mock-data";
import { formatCurrency, formatDate, daysUntil, cn } from "@/lib/utils";

export function UpcomingBills() {
  const billsWithDays = UPCOMING_BILLS.map((bill) => ({
    ...bill,
    daysLeft: daysUntil(bill.dueDate),
  })).sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarClock className="h-4 w-4 text-blue-500" />
            Tagihan Mendatang
          </CardTitle>
          <CardDescription className="text-xs">
            {billsWithDays.filter((b) => b.daysLeft <= 7).length} tagihan jatuh tempo dalam 7 hari
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
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
                  "flex items-center gap-3 rounded-xl p-2.5 transition-colors border border-[var(--card-border)] bg-[var(--card)]",
                  isUrgent
                    ? "border-l-4 border-l-rose-500"
                    : isWarning
                    ? "border-l-4 border-l-amber-500"
                    : "border-l-4 border-l-transparent hover:bg-[var(--muted)]/50"
                )}
              >
                {/* Emoji icon */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--muted)]/70 text-base">
                  {bill.emoji}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-medium text-[var(--foreground)]">{bill.name}</p>
                    {isUrgent && <AlertTriangle className="h-3 w-3 text-rose-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {formatDate(bill.dueDate, "dd MMM yyyy")}
                  </p>
                </div>

                {/* Amount + Days badge */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-sm font-semibold text-[var(--foreground)]">
                    {formatCurrency(bill.amount, true)}
                  </span>
                  <Badge
                    variant={isUrgent ? "destructive" : isWarning ? "warning" : "secondary"}
                    className="text-[10px] px-1.5 py-0"
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
