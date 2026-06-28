"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Insight } from "@/lib/types";

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
    bg: "bg-purple-500/8 border-purple-500/20",
    label: "bg-purple-500/10 text-purple-600",
    text: "Tips",
  },
};

export function FinancialInsights({ insights }: { insights: Insight[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="h-full bg-gradient-to-br from-[var(--card)] to-[var(--background)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-purple-500" />
            AI Insights
          </CardTitle>
          <CardDescription className="text-xs">
            Analisis cerdas berdasarkan pola pengeluaran kamu
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 grid gap-3 sm:grid-cols-2">
          {insights.map((insight, i) => {
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
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", style.label)}>
                    {style.text}
                  </span>
                  <span className="text-base">{insight.icon}</span>
                </div>
                <p className="text-xs leading-relaxed text-[var(--foreground)] font-medium">
                  {insight.message}
                </p>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
