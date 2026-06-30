"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Target,
  Plus,
  Edit2,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Calendar,
  TrendingDown,
  ArrowUpDown,
} from "lucide-react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { CATEGORY_META } from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";
import { upsertBudgetItem } from "@/app/actions";
import type { BudgetItemRow } from "@/lib/supabase/types";
import type { Category } from "@/lib/types";

// Schema validasi
const budgetSchema = z.object({
  category: z.string().min(1, "Pilih kategori anggaran"),
  limit: z.number().positive("Limit harus lebih dari 0"),
});
type BudgetFormValues = z.infer<typeof budgetSchema>;

const MONTHS = [
  { value: 0, label: "Januari" },
  { value: 1, label: "Februari" },
  { value: 2, label: "Maret" },
  { value: 3, label: "April" },
  { value: 4, label: "Mei" },
  { value: 5, label: "Juni" },
  { value: 6, label: "Juli" },
  { value: 7, label: "Agustus" },
  { value: 8, label: "September" },
  { value: 9, label: "Oktober" },
  { value: 10, label: "November" },
  { value: 11, label: "Desember" },
];

const YEARS = [2024, 2025, 2026, 2027];

const expenseCategories = [
  { value: "food", label: "Makanan", emoji: "🍔" },
  { value: "transport", label: "Transportasi", emoji: "🚗" },
  { value: "shopping", label: "Belanja", emoji: "🛍️" },
  { value: "bills", label: "Tagihan", emoji: "📄" },
  { value: "entertainment", label: "Hiburan", emoji: "🎮" },
  { value: "health", label: "Kesehatan", emoji: "💊" },
  { value: "other", label: "Lainnya", emoji: "📦" },
];

interface BudgetClientProps {
  initialBudgets: BudgetItemRow[];
  currentMonth: number;
  currentYear: number;
}

export function BudgetClient({ initialBudgets, currentMonth: initialMonth, currentYear: initialYear }: BudgetClientProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [budgets, setBudgets] = useState<BudgetItemRow[]>(initialBudgets);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetItemRow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [rawLimit, setRawLimit] = useState("");

  // Update state when props change
  useEffect(() => {
    setCurrentMonth(initialMonth);
    setCurrentYear(initialYear);
    setBudgets(initialBudgets);
  }, [initialMonth, initialYear, initialBudgets]);

  // Fungsi untuk update query params URL saat dropdown diganti
  const handlePeriodChange = (month: number, year: number) => {
    router.push(`/dashboard/budget?month=${month}&year=${year}`);
  };

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: { limit: 0 },
  });

  // Kalkulasi total
  const totals = useMemo(() => {
    const totalLimit = initialBudgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = initialBudgets.reduce((sum, b) => sum + b.spent, 0);
    const remaining = Math.max(0, totalLimit - totalSpent);
    return { totalLimit, totalSpent, remaining };
  }, [initialBudgets]);

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setRawLimit(raw);
    setValue("limit", Number(raw), { shouldValidate: !!raw });
  };

  const handleOpenAdd = () => {
    setEditingBudget(null);
    reset({ category: "", limit: 0 });
    setRawLimit("");
    setErrorMsg("");
    setDialogOpen(true);
  };

  const handleOpenEdit = (budget: BudgetItemRow) => {
    setEditingBudget(budget);
    reset({ category: budget.category, limit: budget.limit });
    setRawLimit(budget.limit.toString());
    setErrorMsg("");
    setDialogOpen(true);
  };

  const onSubmit = async (data: BudgetFormValues) => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const result = await upsertBudgetItem(data.category, data.limit);

      if (!result.success) {
        setErrorMsg(result.error || "Gagal menyimpan anggaran");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setDialogOpen(false);
      }, 1500);
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan. Coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 lg:pb-10">
      {/* Header */}
      <div className="w-full bg-gradient-to-b from-[var(--muted)]/50 to-transparent border-b border-[var(--card-border)]/40 px-4 pt-5 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-xl flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <Link
                href="/dashboard"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--card-border)] bg-[var(--card)] hover:bg-[var(--muted)] text-[var(--foreground)] transition-all active:scale-95"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-[var(--foreground)] sm:text-lg truncate">
                  Anggaran Bulanan
                </h1>
                <p className="text-[11px] text-[var(--muted-foreground)] truncate hidden xs:block">
                  Kendalikan pengeluaran bulanan Anda per kategori
                </p>
              </div>
            </div>

            <Button onClick={handleOpenAdd} size="sm" className="gap-1 rounded-xl text-xs h-9 shrink-0 shadow-sm cursor-pointer">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Atur Budget</span>
            </Button>
          </div>

          {/* Periode Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto w-full">
            {/* Selector Bulan */}
            <div className="flex-1 sm:flex-initial min-w-[110px]">
              <Select
                value={String(currentMonth)}
                onValueChange={(val) => handlePeriodChange(Number(val), currentYear)}
              >
                <SelectTrigger className="w-full rounded-xl border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] outline-none transition-all duration-150 hover:bg-[var(--muted)] focus:ring-2 focus:ring-emerald-500/30 h-9">
                  <Calendar className="h-3.5 w-3.5 mr-1.5 opacity-60" />
                  <SelectValue placeholder="Bulan" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[var(--card-border)] bg-[var(--card)] shadow-xl max-h-[240px]">
                  {MONTHS.map((m) => (
                    <SelectItem
                      key={m.value}
                      value={String(m.value)}
                      className="text-xs font-medium rounded-lg cursor-pointer"
                    >
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selector Tahun */}
            <div className="flex-1 sm:flex-initial min-w-[80px]">
              <Select
                value={String(currentYear)}
                onValueChange={(val) => handlePeriodChange(currentMonth, Number(val))}
              >
                <SelectTrigger className="w-full rounded-xl border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] outline-none transition-all duration-150 hover:bg-[var(--muted)] focus:ring-2 focus:ring-emerald-500/30 h-9">
                  <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-[var(--card-border)] bg-[var(--card)] shadow-xl">
                  {YEARS.map((y) => (
                    <SelectItem
                      key={y}
                      value={String(y)}
                      className="text-xs font-medium rounded-lg cursor-pointer"
                    >
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-screen-xl px-4 py-4 sm:px-6 lg:px-8 space-y-4">
        {/* Ringkasan Anggaran (Responsive layout font & spacing) */}
        {/* Interactive Premium Budget Summary Box Layout */}
        <div className="grid grid-cols-3 gap-3 bg-[var(--card)] border border-[var(--card-border)]/50 p-2 sm:p-3.5 rounded-2xl shadow-sm/5 relative overflow-hidden">
          {/* Limit */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 py-1.5 px-1 border-r border-[var(--card-border)]/30 group/stat hover:bg-[var(--muted)]/30 rounded-xl transition-colors duration-150">
            <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
              <Target className="h-4 w-4" />
            </div>
            <div className="text-center sm:text-left min-w-0 flex-1">
              <p className="text-[9px] sm:text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider leading-none">Limit</p>
              <p className="text-xs sm:text-base font-bold text-blue-500 mt-1 tabular-nums truncate">
                {formatCurrency(totals.totalLimit, true)}
              </p>
            </div>
          </div>

          {/* Terpakai */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 py-1.5 px-1 border-r border-[var(--card-border)]/30 group/stat hover:bg-[var(--muted)]/30 rounded-xl transition-colors duration-150">
            <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 shrink-0">
              <TrendingDown className="h-4 w-4" />
            </div>
            <div className="text-center sm:text-left min-w-0 flex-1">
              <p className="text-[9px] sm:text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider leading-none">Terpakai</p>
              <p className="text-xs sm:text-base font-bold text-rose-500 mt-1 tabular-nums truncate">
                {formatCurrency(totals.totalSpent, true)}
              </p>
            </div>
          </div>

          {/* Sisa */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-3 py-1.5 px-1 group/stat hover:bg-[var(--muted)]/30 rounded-xl transition-colors duration-150">
            <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
              <ArrowUpDown className="h-4 w-4" />
            </div>
            <div className="text-center sm:text-left min-w-0 flex-1">
              <p className="text-[9px] sm:text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider leading-none">Sisa</p>
              <p className="text-xs sm:text-base font-bold text-emerald-500 mt-1 tabular-nums truncate px-1 sm:px-0 rounded-md inline-block max-w-full bg-emerald-500/5 sm:bg-transparent">
                {formatCurrency(totals.remaining, true)}
              </p>
            </div>
          </div>
        </div>

        {/* List Anggaran */}
        <Card className="overflow-hidden shadow-sm border-[var(--card-border)]">
          <CardContent className="p-0">
            {initialBudgets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-[var(--muted-foreground)] text-center px-4 bg-[var(--card)]">
                <Target className="h-10 w-10 opacity-20" />
                <div>
                  <p className="font-semibold text-sm sm:text-base text-[var(--foreground)]">
                    Belum Ada Anggaran
                  </p>
                  <p className="text-[11px] mt-1 opacity-80 max-w-[260px] mx-auto">
                    Buat anggaran bulanan pertama Anda untuk membatasi pengeluaran.
                  </p>
                  <Button onClick={handleOpenAdd} className="mt-4 gap-1 rounded-xl text-xs h-9 cursor-pointer" size="sm">
                    <Plus className="h-4 w-4" />
                    Atur Sekarang
                  </Button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[var(--card-border)]/35">
                {initialBudgets.map((item, i) => {
                  const pct = Math.min(Math.round((item.spent / item.limit) * 100), 999);
                  const isOver = pct >= 100;
                  const isWarning = pct >= 80 && pct < 100;
                  const meta = CATEGORY_META[item.category as Category] || { emoji: "📝", label: item.category };

                  // Rombak ke utility class untuk kecocokan penuh dengan Shadcn Progress
                  const progressBgClass = isOver
                    ? "bg-rose-500"
                    : isWarning
                      ? "bg-amber-500"
                      : "bg-emerald-500 dark:bg-emerald-600";

                  const pctColorClass = isOver
                    ? "text-rose-500 font-bold"
                    : isWarning
                      ? "text-amber-500 font-semibold"
                      : "text-[var(--muted-foreground)] font-medium";

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.03 }}
                      className="p-4 flex flex-col gap-2.5 hover:bg-[var(--muted)]/30 transition-colors"
                    >
                      {/* Row 1: Header/Label & Edit */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] border border-[var(--card-border)]/10 text-base shadow-sm">
                            {meta.emoji}
                          </div>
                          <span className="text-xs sm:text-sm font-semibold text-[var(--foreground)] truncate">
                            {meta.label}
                          </span>
                          {(isOver || isWarning) && (
                            <span className={cn(
                              "flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide shrink-0",
                              isOver ? "bg-rose-500/10 text-rose-500 animate-pulse" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            )}>
                              {isOver ? "Overlimit" : "Warning"}
                            </span>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenEdit(item)}
                          className="text-[var(--muted-foreground)] hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl h-8 w-8 cursor-pointer shrink-0"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Row 2: Progress bar + Info Split bawah (Mobile-friendly layout) */}
                      <div className="space-y-2">
                        <Progress
                          value={Math.min(pct, 100)}
                          className={cn(
                            "h-2 rounded-full bg-[var(--muted)] border border-[var(--card-border)]/10",
                            // Perbaikan: Mengincar elemen indikator di dalam Progress menggunakan [&>div]
                            isOver
                              ? "[&>div]:bg-rose-500"
                              : isWarning
                                ? "[&>div]:bg-amber-500"
                                : "[&>div]:bg-emerald-500 dark:[&>div]:bg-emerald-600"
                          )}
                        />
                        <div className="flex justify-between items-center text-[10px] sm:text-xs font-medium text-[var(--muted-foreground)] tabular-nums">
                          <span className="truncate max-w-[80%]">
                            {formatCurrency(item.spent, true)} <span className="opacity-40">/</span> {formatCurrency(item.limit, true)}
                          </span>
                          <span className={cn("shrink-0 pl-1", pctColorClass)}>
                            {pct}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Dialog Form (Mobile-responsive drawer look-alike) */}
      <AnimatePresence>
        {dialogOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setDialogOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 240 }}
              className="relative w-full max-w-md rounded-t-[1.75rem] sm:rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 sm:p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto pb-8 sm:pb-6"
            >
              {/* Swipe/Pull Handle bar decor khusus mobile */}
              <div className="h-1 w-12 bg-[var(--card-border)]/60 rounded-full mx-auto mb-3 sm:hidden" onClick={() => setDialogOpen(false)} />

              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                    <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-base text-[var(--foreground)]">Anggaran Berhasil Disimpan!</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Limit baru berhasil diperbarui dalam sistem.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-[var(--card-border)]/40">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                      <Target className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm sm:text-base font-bold text-[var(--foreground)] truncate">
                        {editingBudget ? "Edit Batas Anggaran" : "Atur Anggaran Kategori"}
                      </h2>
                      <p className="text-[11px] sm:text-xs text-[var(--muted-foreground)] truncate mt-0.5 opacity-80">
                        {editingBudget ? `Sesuaikan limit anggaran untuk ${CATEGORY_META[editingBudget.category as Category]?.label || editingBudget.category}` : "Pilih kategori dan tentukan batas limit bulanan"}
                      </p>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 px-3 py-2.5 text-xs text-rose-600">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {errorMsg}
                    </div>
                  )}

                  {/* Kategori */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[var(--muted-foreground)]">Kategori Pengeluaran</Label>
                    {editingBudget ? (
                      <Input
                        disabled
                        value={CATEGORY_META[editingBudget.category as Category]?.label || editingBudget.category}
                        className="bg-[var(--muted)]/50 rounded-xl h-10 text-sm font-semibold text-[var(--foreground)]"
                      />
                    ) : (
                      <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="rounded-xl h-10 text-xs sm:text-sm cursor-pointer">
                              <SelectValue placeholder="Pilih kategori..." />
                            </SelectTrigger>
                            <SelectContent>
                              {expenseCategories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  <span className="flex items-center gap-2 text-xs sm:text-sm">
                                    <span>{cat.emoji}</span>
                                    <span>{cat.label}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    )}
                    {errors.category && (
                      <p className="text-[11px] text-rose-500 font-medium">{errors.category.message}</p>
                    )}
                  </div>

                  {/* Limit */}
                  <div className="space-y-1.5">
                    <Label htmlFor="limit" className="text-xs font-semibold text-[var(--muted-foreground)]">Batas Limit Bulanan</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--muted-foreground)]">
                        Rp
                      </span>
                      <Input
                        id="limit"
                        inputMode="numeric"
                        placeholder="0"
                        value={rawLimit ? Number(rawLimit).toLocaleString("id-ID") : ""}
                        onChange={handleLimitChange}
                        className="pl-9 pr-3 text-right font-bold text-sm sm:text-base h-10 rounded-xl tabular-nums focus-visible:ring-1 focus-visible:ring-[var(--ring)]"
                      />
                    </div>
                    {errors.limit && (
                      <p className="text-[11px] text-rose-500 font-medium">{errors.limit.message}</p>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-2.5 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                      className="flex-1 rounded-xl h-10 text-xs font-bold cursor-pointer"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 rounded-xl h-10 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 cursor-pointer"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-1.5 justify-center">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Menyimpan...</span>
                        </div>
                      ) : (
                        "Simpan Limit"
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}