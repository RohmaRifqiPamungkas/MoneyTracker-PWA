"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Wallet,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addTransaction } from "@/app/actions";
import { CATEGORY_META, BANK_ACCOUNTS as MOCK_BANK_ACCOUNTS } from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";
import type { BankAccountRow } from "@/lib/supabase/types";

/* ── Custom Category Types & Storage ─────────────────────── */
interface CustomCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

const STORAGE_KEY = "moneytracker_custom_categories";

const EMOJI_OPTIONS = ["🏷️", "🎯", "🌟", "💫", "⭐", "🔥", "💎", "🎁", "🎪", "🎭", "🎨", "🎲", "🎸", "🎺", "🎻", "🏆", "🥇", "🎖️", "🏅"];
const COLOR_OPTIONS = ["#10b981", "#6366f1", "#f59e0b", "#3b82f6", "#ec4899", "#14b8a6", "#8b5cf6", "#06b6d4", "#f97316", "#ef4444", "#84cc16", "#a855f7"];

function loadCustomCategories(): CustomCategory[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCustomCategories(cats: CustomCategory[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
}

/* ── Zod schema ─────────────────────────────────────────── */
const schema = z.object({
  amount: z.number().positive("Nominal harus lebih dari 0"),
  type: z.enum(["income", "expense"]),
  bankAccountId: z.string().min(1, "Pilih rekening"),
  category: z.string().min(1, "Pilih kategori"),
  name: z.string().min(2, "Min. 2 karakter").max(60),
  date: z.string().min(1, "Pilih tanggal"),
  notes: z.string().max(200).optional(),
});

type FormValues = z.infer<typeof schema>;

const incomeCategories = ["salary", "freelance", "investment", "other"] as const;
const expenseCategories = ["food", "transport", "shopping", "bills", "entertainment", "health", "other"] as const;

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultType?: "income" | "expense";
  bankAccounts?: BankAccountRow[];
}

function StepIndicator({ total, current, onBack, showBack }: { total: number; current: number; onBack: () => void; showBack: boolean }) {
  return (
    <div className="flex items-center justify-between px-1 mb-2">
      <div className="w-8">
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--card-border)]/60 bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-all active:scale-90"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "rounded-full transition-all duration-300",
              i === current
                ? "w-5 h-1.5 bg-emerald-500"
                : i < current
                  ? "w-1.5 h-1.5 bg-emerald-500/40"
                  : "w-1.5 h-1.5 bg-[var(--card-border)]"
            )}
          />
        ))}
      </div>
      <div className="w-8" />
    </div>
  );
}

/* ── MAIN COMPONENT ─────────────────────────────────────────── */
export function TransactionDialog({
  open,
  onOpenChange,
  defaultType = "expense",
  bankAccounts = [],
}: TransactionDialogProps) {
  const [step, setStep] = useState(0); // 0: Info Awal, 1: Detail Lengkap, 2: Sukses, 3: Form Kategori Kustom (Multi-step)
  const [isLoading, setLoading] = useState(false);
  const [rawAmount, setRawAmount] = useState("");
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  
  // State manajemen pembuatan kategori kustom
  const [newCatName, setNewCatName] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("🏷️");
  const [newCatColor, setNewCatColor] = useState("#10b981");

  // Muat kategori kustom saat dialog dibuka
  useEffect(() => {
    if (open) {
      setCustomCategories(loadCustomCategories());
    }
  }, [open]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: defaultType,
      date: new Date().toISOString().split("T")[0],
    },
  });

  const type = watch("type");
  const bankId = watch("bankAccountId");

  // Pisahkan kategori bawaan dan kustom berdasarkan tipe transaksi aktif
  const getAllCategories = () => {
    const defaults = type === "income" ? incomeCategories : expenseCategories;
    const customForType = customCategories.filter(c => c.id.startsWith(`custom_${type}_`));
    return { defaults, custom: customForType };
  };

  const handleCreateCategory = () => {
    if (!newCatName.trim()) return;

    const newId = `custom_${type}_${Date.now()}`;
    const newCat: CustomCategory = {
      id: newId,
      name: newCatName.trim(),
      emoji: newCatEmoji,
      color: newCatColor,
    };

    const updated = [...customCategories, newCat];
    setCustomCategories(updated);
    saveCustomCategories(updated);
    
    // Set otomatis kategori form utama dengan ID yang baru saja dibuat
    setValue("category", newId, { shouldValidate: true });
    
    // Reset state input kategori kustom & kembali ke Step 1
    setNewCatName("");
    setNewCatEmoji("🏷️");
    setNewCatColor("#10b981");
    setStep(1);
  };

  const handleDeleteCategory = (catId: string) => {
    const updated = customCategories.filter(c => c.id !== catId);
    setCustomCategories(updated);
    saveCustomCategories(updated);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setRawAmount(raw);
    setValue("amount", Number(raw), { shouldValidate: !!raw });
  };

  const handleNextStep = async () => {
    const ok = await trigger(["amount", "bankAccountId"]);
    if (ok) setStep(1);
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const result = await addTransaction({
      name: data.name,
      amount: data.amount,
      type: data.type,
      category: data.category,
      date: data.date,
      notes: data.notes,
      bank_account_id: data.bankAccountId,
    });

    setLoading(false);

    if (!result.success) {
      alert(result.error || "Gagal menyimpan transaksi.");
      return;
    }

    setStep(2);
    setTimeout(() => {
      handleOpenChange(false);
    }, 1800);
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      reset({ type: defaultType, date: new Date().toISOString().split("T")[0] });
      setRawAmount("");
      setNewCatName("");
      setStep(0);
    }
    onOpenChange(v);
  };

  const displayBankAccounts =
    bankAccounts.length > 0
      ? bankAccounts.map((account) => ({
          id: account.id,
          name: account.name,
          balance: account.balance,
          logo: account.logo,
          gradient: account.gradient,
        }))
      : MOCK_BANK_ACCOUNTS;

  const { defaults: categoryDefaults, custom: categoryCustom } = getAllCategories();
  const selectedBank = displayBankAccounts.find((b) => b.id === bankId);
  const isSelectedBankImgLogo = selectedBank?.logo?.startsWith("/");

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showHandle className={cn("p-0 overflow-hidden rounded-t-[1.75rem] sm:rounded-2xl transition-all duration-200", step === 3 ? "max-w-md" : "max-w-md")}>
        {/* Dynamic Header Header */}
        <DialogHeader className="p-5 pb-3 border-b border-[var(--card-border)]/40">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", step === 3 ? "bg-violet-500/10 text-violet-500" : "bg-emerald-500/10 text-emerald-500")}>
              {step === 3 ? <Sparkles className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
            </div>
            <div>
              <DialogTitle className="text-sm sm:text-base font-bold">
                {step === 3 ? "Buat Kategori Baru" : "Tambah Transaksi"}
              </DialogTitle>
              <DialogDescription className="text-[11px] sm:text-xs mt-0.5 opacity-80">
                {step === 3 ? "Sesuaikan nama, emoji, dan warna kategori" : step === 0 ? "Tentukan nominal rupiah & rekening" : "Lengkapi detail catatan transaksi"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-5 py-4 overflow-y-auto max-h-[76vh] sm:max-h-[550px] custom-scrollbar">
          <AnimatePresence mode="wait">

            {/* ── STEP 2: SUCCESS VIEW ─────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 gap-4 text-center"
              >
                <div className="relative flex h-14 w-14 items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
                    <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                  </div>
                </div>
                <div className="space-y-1 px-2">
                  <p className="text-base font-bold text-[var(--foreground)]">Transaksi Berhasil Disimpan!</p>
                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    Catatan {type === "income" ? "pemasukan" : "pengeluaran"}{" "}
                    <span className="font-bold text-[var(--foreground)] tabular-nums">
                      {formatCurrency(Number(rawAmount))}
                    </span>{" "}
                    telah tercatat pada dompet{" "}
                    <span className="font-bold text-[var(--foreground)]">
                      {selectedBank?.name}
                    </span>
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── STEP 0: INITIAL INFO ────────────────────── */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 pt-0.5"
              >
                <StepIndicator total={2} current={0} onBack={() => { }} showBack={false} />

                {/* Segmented Type Toggle */}
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <div className="flex rounded-xl bg-[var(--muted)]/60 p-1 gap-1 border border-[var(--card-border)]/20">
                      <TypeButton active={field.value === "income"} onClick={() => field.onChange("income")} icon={<TrendingUp className="h-4 w-4" />} label="Pemasukan" activeClass="text-emerald-600 dark:text-emerald-400 bg-[var(--card)] border border-[var(--card-border)]/40 shadow-sm" />
                      <TypeButton active={field.value === "expense"} onClick={() => field.onChange("expense")} icon={<TrendingDown className="h-4 w-4" />} label="Pengeluaran" activeClass="text-rose-600 dark:text-rose-400 bg-[var(--card)] border border-[var(--card-border)]/40 shadow-sm" />
                    </div>
                  )}
                />

                {/* Amount Input */}
                <div className="space-y-1.5">
                  <Label htmlFor="d-amount" className="text-xs font-semibold text-[var(--muted-foreground)]">Nominal</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--muted-foreground)]">
                      Rp
                    </span>
                    <Input
                      id="d-amount"
                      inputMode="numeric"
                      placeholder="0"
                      value={rawAmount ? Number(rawAmount).toLocaleString("id-ID") : ""}
                      onChange={handleAmountChange}
                      className="h-12 pl-10 pr-4 text-right font-bold text-lg rounded-xl border border-[var(--card-border)] focus-visible:ring-1 focus-visible:ring-[var(--ring)] tabular-nums"
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-[11px] text-rose-500 font-medium">{errors.amount.message}</p>
                    )}
                </div>

                {/* Bank Grid View */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-[var(--muted-foreground)]">Pilih Dompet / Rekening</Label>
                  <Controller
                    name="bankAccountId"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-3 gap-2">
                        {displayBankAccounts.map((account) => {
                          const isSelected = field.value === account.id;
                          const isImgLogo = account.logo?.startsWith("/");
                          return (
                            <button
                              key={account.id}
                              type="button"
                              onClick={() => field.onChange(account.id)}
                              className={cn(
                                "relative flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-center transition-all duration-150 select-none cursor-pointer min-h-[75px]",
                                isSelected
                                  ? "border-transparent shadow-sm text-white"
                                  : "border-[var(--card-border)] bg-[var(--muted)]/30 hover:bg-[var(--muted)]/70 text-[var(--muted-foreground)]"
                              )}
                              style={
                                isSelected
                                  ? { background: `linear-gradient(135deg, ${account.gradient[0]}, ${account.gradient[1]})` }
                                  : {}
                              }
                            >
                              {isImgLogo ? (
                                <div className={cn("h-6 flex items-center justify-center rounded-md p-0.5 w-10 shrink-0", isSelected ? "bg-white/95 shadow-sm" : "bg-transparent")}>
                                  <img src={account.logo} alt={account.name} className="max-h-full max-w-full object-contain" />
                                </div>
                              ) : (
                                <span className="text-lg sm:text-xl leading-none">{account.logo}</span>
                              )}

                              <span className={cn("text-[10px] font-bold tracking-tight truncate w-full px-0.5", isSelected ? "text-white" : "text-[var(--foreground)]")}>
                                {account.name}
                              </span>
                              {isSelected && (
                                <span className="text-[8px] text-white/85 font-medium tracking-wide tabular-nums truncate w-full">
                                  {formatCurrency(account.balance, true)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />
                  {errors.bankAccountId && (
                    <p className="text-[11px] text-rose-500 font-medium">{errors.bankAccountId.message}</p>
                  )}
                </div>

                {/* Active Wallet Details Anchor banner */}
                <div className="min-h-[50px]">
                  <AnimatePresence mode="wait">
                    {selectedBank && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="flex items-center gap-3 rounded-xl p-2.5 border border-[var(--card-border)]/40 bg-[var(--muted)]/40"
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm border border-[var(--card-border)]/10 overflow-hidden",
                            isSelectedBankImgLogo ? "bg-white p-1 shadow-sm" : ""
                          )}
                          style={!isSelectedBankImgLogo ? { background: `linear-gradient(135deg, ${selectedBank.gradient[0]}20, ${selectedBank.gradient[1]}10)` } : undefined}
                        >
                          {isSelectedBankImgLogo ? (
                            <img src={selectedBank.logo} alt={selectedBank.name} className="max-h-full max-w-full object-contain" />
                          ) : (
                            selectedBank.logo
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-[var(--foreground)] truncate">{selectedBank.name}</p>
                          <p className="text-[10px] text-[var(--muted-foreground)] font-medium mt-0.5 tabular-nums">
                            Sisa Saldo Saat Ini: {formatCurrency(selectedBank.balance, true)}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  type="button"
                  size="lg"
                  onClick={handleNextStep}
                  className="w-full h-11 text-xs font-bold rounded-xl gap-1.5 mt-2 shadow-sm text-white bg-emerald-600 hover:bg-emerald-500 cursor-pointer"
                >
                  <span>Lanjut Isi Detail</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {/* ── STEP 1: COMPLEMENTARY DETAILS ──────────────────────────── */}
            {step === 1 && (
              <motion.form
                key="step1"
                onSubmit={handleSubmit(onSubmit)}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 pt-0.5"
              >
                <StepIndicator total={2} current={1} onBack={() => setStep(0)} showBack={true} />

                <div className="flex items-center gap-3 rounded-xl border border-[var(--card-border)]/50 bg-[var(--muted)]/30 p-2.5">
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm overflow-hidden",
                    isSelectedBankImgLogo ? "bg-white p-1 shadow-sm" : "bg-[var(--card)]"
                  )}>
                    {isSelectedBankImgLogo ? (
                      <img src={selectedBank?.logo} alt={selectedBank?.name} className="max-h-full max-w-full object-contain" />
                    ) : (
                      selectedBank?.logo
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-[var(--muted-foreground)]">
                      {type === "income" ? "Rencana Masuk" : "Rencana Keluar"} &bull; {selectedBank?.name}
                    </p>
                    <p className="text-sm font-bold text-[var(--foreground)] tabular-nums mt-0.5">
                      {formatCurrency(Number(rawAmount))}
                    </p>
                  </div>
                </div>

                {/* Input Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="d-name" className="text-xs font-semibold text-[var(--muted-foreground)]">Nama Transaksi</Label>
                  <Input
                    id="d-name"
                    placeholder="Mis. Belanja Mingguan, Makan Siang, Gaji…"
                    className="h-10 text-sm rounded-xl"
                    {...register("name")}
                  />
                  {errors.name && <p className="text-[11px] text-rose-500 font-medium">{errors.name.message}</p>}
                </div>

                {/* Category Grid Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-[var(--muted-foreground)]">Pilih Kategori</Label>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors cursor-pointer"
                    >
                      <PlusCircle className="h-3 w-3" />
                      <span>Custom</span>
                    </button>
                  </div>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2 max-h-[120px] overflow-y-auto pr-0.5 custom-scrollbar">
                        {/* Default Categories */}
                        <div className="grid grid-cols-3 gap-2">
                          {categoryDefaults.map((cat) => {
                            const meta = CATEGORY_META[cat];
                            const isSelected = field.value === cat;
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => field.onChange(cat)}
                                className={cn(
                                  "flex flex-col items-center justify-center gap-1 rounded-xl border py-2 px-1 text-center transition-all duration-150 select-none cursor-pointer min-h-[56px]",
                                  isSelected
                                    ? "border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm"
                                    : "border-[var(--card-border)] bg-[var(--muted)]/40 text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80"
                                )}
                              >
                                <span className="text-base leading-none">{meta?.emoji}</span>
                                <span className="text-[10px] leading-tight truncate w-full px-0.5">
                                  {meta?.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        {/* Custom Categories */}
                        {categoryCustom.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[var(--card-border)]/30">
                            {categoryCustom.map((cat) => {
                              const isSelected = field.value === cat.id;
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => field.onChange(cat.id)}
                                  className={cn(
                                    "flex flex-col items-center justify-center gap-1 rounded-xl border py-2 px-1 text-center transition-all duration-150 select-none cursor-pointer min-h-[56px] relative group",
                                    isSelected
                                      ? "border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm"
                                      : "border-[var(--card-border)] bg-[var(--muted)]/40 text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80"
                                  )}
                                  style={isSelected ? { borderColor: cat.color, backgroundColor: `${cat.color}10` } : {}}
                                >
                                  <span className="text-base leading-none">{cat.emoji}</span>
                                  <span className="text-[10px] leading-tight truncate w-full px-0.5">
                                    {cat.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCategory(cat.id);
                                      if (field.value === cat.id) field.onChange("");
                                    }}
                                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                  >
                                    <X className="h-2.5 w-2.5" />
                                  </button>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  />
                  {errors.category && <p className="text-[11px] text-rose-500 font-medium">{errors.category.message}</p>}
                </div>

                {/* Responsive Date + Notes Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="d-date" className="text-xs font-semibold text-[var(--muted-foreground)]">Tanggal</Label>
                    <Input id="d-date" type="date" className="h-10 text-sm rounded-xl" {...register("date")} />
                    {errors.date && <p className="text-[11px] text-rose-500 font-medium">{errors.date.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="d-notes" className="text-xs font-semibold text-[var(--muted-foreground)]">Catatan <span className="opacity-50 font-normal">(opsional)</span></Label>
                    <Textarea id="d-notes" placeholder="Tulis deskripsi singkat…" rows={1} className="h-10 min-h-[40px] text-sm rounded-xl resize-none py-2" {...register("notes")} />
                  </div>
                </div>

                {/* Submit Action */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className={cn(
                    "w-full h-11 text-xs font-bold rounded-xl gap-1.5 mt-2 text-white cursor-pointer shadow-sm transition-all",
                    type === "income" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"
                  )}
                >
                  {isLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> <span>Sedang Menyimpan…</span></>
                  ) : (
                    <><PlusCircle className="h-4 w-4" /> <span>Simpan Transaksi</span></>
                  )}
                </Button>
              </motion.form>
            )}

            {/* ── STEP 3: CREATE CUSTOM CATEGORY VIEW (MULTI-STEP INTEGRATED) ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 pt-0.5"
              >
                {/* Tombol Back yang mengembalikan alur ke Detail Form (Step 1) */}
                <StepIndicator total={1} current={0} onBack={() => setStep(1)} showBack={true} />

                {/* Preview Tampilan */}
                <div className="flex items-center justify-center py-1">
                  <div
                    className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 py-2 px-5 min-w-[70px]"
                    style={{ borderColor: newCatColor, backgroundColor: `${newCatColor}15` }}
                  >
                    <span className="text-xl leading-none">{newCatEmoji}</span>
                    <span className="text-[10px] font-bold" style={{ color: newCatColor }}>
                      {newCatName || "Nama"}
                    </span>
                  </div>
                </div>

                {/* Category Name Input */}
                <div className="space-y-1">
                  <Label className="text-[10px] font-semibold text-[var(--muted-foreground)]">Nama Kategori</Label>
                  <Input
                    placeholder="Nama kategori..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="h-10 text-xs rounded-xl"
                    maxLength={20}
                    autoFocus
                  />
                </div>

                {/* Emoji Selection */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">Emoji</span>
                  <div className="flex flex-wrap gap-1 p-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--muted)]/30 max-h-[70px] overflow-y-auto custom-scrollbar">
                    {EMOJI_OPTIONS.map((emoji, idx) => (
                      <button
                        key={`${emoji}-${idx}`}
                        type="button"
                        onClick={() => setNewCatEmoji(emoji)}
                        className={cn(
                          "h-7 w-7 flex items-center justify-center rounded-md text-sm transition-all cursor-pointer",
                          newCatEmoji === emoji
                            ? "bg-[var(--card)] shadow-sm ring-2 ring-violet-500/50"
                            : "hover:bg-[var(--muted)]/80"
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-[var(--muted-foreground)]">Warna</span>
                  <div className="flex flex-wrap gap-2 p-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--muted)]/30">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCatColor(color)}
                        className={cn(
                          "h-6 w-6 rounded-full transition-all cursor-pointer",
                          newCatColor === color ? "ring-2 ring-offset-1 ring-offset-[var(--card)] scale-110" : "hover:scale-110"
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Action Submit Kategori */}
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreateCategory}
                  disabled={!newCatName.trim()}
                  className="w-full h-10 text-xs font-bold rounded-xl bg-violet-600 hover:bg-violet-500 text-white cursor-pointer disabled:opacity-50 mt-1 shadow-sm"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Simpan Kategori
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TypeButton({ active, onClick, icon, label, activeClass }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string; activeClass: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs sm:text-sm font-semibold transition-all duration-150 select-none cursor-pointer",
        active ? `${activeClass}` : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      )}
    >
      {icon}<span>{label}</span>
    </button>
  );
}
