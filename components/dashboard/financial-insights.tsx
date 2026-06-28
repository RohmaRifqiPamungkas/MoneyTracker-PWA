"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Insight } from "@/lib/types";

const insightStyles = {
  warning: {
    bg: "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/15 dark:border-amber-500/20",
    label: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    text: "Perhatian",
  },
  success: {
    bg: "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/15 dark:border-emerald-500/20",
    label: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    text: "Pencapaian",
  },
  info: {
    bg: "bg-blue-500/5 dark:bg-blue-500/10 border-blue-500/15 dark:border-blue-500/20",
    label: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    text: "Informasi",
  },
  tip: {
    bg: "bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/15 dark:border-purple-500/20",
    label: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    text: "Tips",
  },
};

export function FinancialInsights({ insights }: { insights: Insight[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="h-full"
    >
      <Card className="h-full border-[var(--card-border)] bg-gradient-to-br from-[var(--card)] to-[var(--background)]">
        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-semibold">AI Insights</CardTitle>
              <CardDescription className="text-[11px] sm:text-xs mt-0.5">
                Analisis cerdas berdasarkan pola pengeluaran kamu
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* PERUBAHAN UTAMA: Ubah ke grid-cols-1 di mobile, baru grid-cols-2 di tablet/desktop (md:) */}
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((insight, i) => {
            const style = insightStyles[insight.type];
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.25 }}
                className={cn(
                  "flex flex-col justify-between rounded-xl border p-3.5 transition-all duration-200 active:scale-[0.99] md:hover:-translate-y-0.5 shadow-sm/5",
                  style.bg
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={cn(
                      "text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider",
                      style.label
                    )}>
                      {style.text}
                    </span>
                    <span className="text-base leading-none select-none shrink-0" role="img" aria-label={style.text}>
                      {insight.icon}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-[var(--foreground)] font-medium">
                    {insight.message}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}