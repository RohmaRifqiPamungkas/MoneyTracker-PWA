"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FINANCIAL_INSIGHTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const insightStyles = {
  warning: {
    bg: "bg-amber-500/8 border-amber-500/20",
    label: "bg-amber-500/10 text-amber-600",
    text: "Perhatian",
  },
  success: {
    bg: "bg-emerald-500/8 border-emerald-500/20",
    label: "bg-emerald-500/10 text-emerald-600",
    text: "Pencapaian",
  },
  info: {
    bg: "bg-blue-500/8 border-blue-500/20",
    label: "bg-blue-500/10 text-blue-600",
    text: "Informasi",
  },
  tip: {
    bg: "bg-violet-500/8 border-violet-500/20",
    label: "bg-violet-500/10 text-violet-600",
    text: "Tips",
  },
};

export function FinancialInsights() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-violet-500" />
            Insight Keuangan
          </CardTitle>
          <CardDescription className="text-xs">
            Analisis cerdas berdasarkan pola pengeluaran kamu
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 grid gap-3 sm:grid-cols-2">
          {FINANCIAL_INSIGHTS.map((insight, i) => {
            const style = insightStyles[insight.type];
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.07 * i, duration: 0.3 }}
                className={cn(
                  "rounded-xl border p-3.5 transition-transform hover:-translate-y-0.5 duration-200 cursor-default",
                  style.bg
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0 leading-none mt-0.5">{insight.icon}</span>
                  <div className="space-y-1.5">
                    <span
                      className={cn(
                        "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        style.label
                      )}
                    >
                      {style.text}
                    </span>
                    <p className="text-sm leading-relaxed text-[var(--foreground)]">
                      {insight.message}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
