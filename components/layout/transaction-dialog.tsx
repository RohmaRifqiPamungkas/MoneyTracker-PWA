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
  ArrowRightLeft,
  Wallet,
  ArrowRight,
  ArrowLeft,
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
import { addTransaction, createCategory, createTransferTransaction } from "@/app/actions";
import { BANK_ACCOUNTS as MOCK_BANK_ACCOUNTS } from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";
import type { BankAccountRow } from "@/lib/supabase/types";
import type { AvailableTransactionCategories, CategoryOption } from "@/lib/supabase/queries";

const EMOJI_OPTIONS = ["🏷️", "🎯", "🌟", "💫", "⭐", "🔥", "💎", "🎁", "🎪", "🎭", "🎨", "🎲", "🎸", "🎺", "🎻", "🏆", "🥇", "🎖️", "🏅"];
const COLOR_OPTIONS = ["#10b981", "#6366f1", "#f59e0b", "#3b82f6", "#ec4899", "#14b8a6", "#8b5cf6", "#06b6d4", "#f97316", "#ef4444", "#84cc16", "#a855f7"];

function slugifyCategoryName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

/* ── Zod schema ─────────────────────────────────────────── */
const schema = z
  .object({
    amount: z.number().positive("Nominal harus lebih dari 0"),
    type: z.enum(["income", "expense", "transfer"]),
    bankAccountId: z.string().min(1, "Pilih rekening asal"),
    transferAccountId: z.string().optional(),
    category: z.string(),
    name: z.string().min(2, "Min. 2 karakter").max(60),
    date: z.string().min(1, "Pilih tanggal"),
    notes: z.string().max(200).optional(),
  })
  .superRefine((values, ctx) => {
    if (values.type !== "transfer" && !values.category) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["category"],
        message: "Pilih kategori",
      });
    }

    if (values.type === "transfer") {
      if (!values.transferAccountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["transferAccountId"],
          message: "Pilih rekening tujuan",
        });
      }

      if (values.transferAccountId && values.transferAccountId === values.bankAccountId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["transferAccountId"],
          message: "Rekening tujuan harus berbeda",
        });
      }
    }
  });

type FormValues = z.infer<typeof schema>;

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultType?: "income" | "expense" | "transfer";
  bankAccounts?: BankAccountRow[];
  availableCategories: AvailableTransactionCategories;
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
  availableCategories,
}: TransactionDialogProps) {
  const [step, setStep] = useState(0); // 0: Info Awal, 1: Detail Lengkap, 2: Sukses, 3: Form Kategori Kustom (Multi-step)
  const [isLoading, setLoading] = useState(false);
  const [rawAmount, setRawAmount] = useState("");
  const [categoryState, setCategoryState] = useState<AvailableTransactionCategories>(availableCategories);
  
  // State manajemen pembuatan kategori kustom
  const [newCatName, setNewCatName] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("🏷️");
  const [newCatColor, setNewCatColor] = useState("#10b981");

  // Muat kategori kustom saat dialog dibuka
  useEffect(() => {
    if (open) {
      setCategoryState(availableCategories);
    }
  }, [availableCategories, open]);

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
      transferAccountId: "",
    },
  });

  const type = watch("type");
  const selectedCategory = watch("category");
  const bankId = watch("bankAccountId");
  const transferBankId = watch("transferAccountId");

  // Pisahkan kategori bawaan dan kustom berdasarkan tipe transaksi aktif
  const getAllCategories = () => {
    const defaults = type === "income" ? categoryState.income : categoryState.expense;
    return { defaults };
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim() || type === "transfer") return;

    const slug = slugifyCategoryName(newCatName);
    if (!slug) return;

    const result = await createCategory({
      name: newCatName.trim(),
      slug,
      type,
      emoji: newCatEmoji,
      color: newCatColor,
    });

    if (!result.success || !result.data) {
      alert(result.error || "Gagal menyimpan kategori.");
      return;
    }

    const newCategory: CategoryOption = {
      id: result.data.id,
      slug: result.data.slug,
      name: result.data.name,
      type: result.data.type,
      emoji: result.data.emoji,
      color: result.data.color,
      is_system: result.data.is_system,
    };

    setCategoryState((current) => {
      const nextBySlug = { ...current.bySlug, [newCategory.slug]: newCategory };
      return newCategory.type === "income"
        ? {
            bySlug: nextBySlug,
            income: [...current.income.filter((item) => item.slug !== newCategory.slug), newCategory],
            expense: current.expense,
          }
        : {
            bySlug: nextBySlug,
            income: current.income,
            expense: [...current.expense.filter((item) => item.slug !== newCategory.slug), newCategory],
          };
    });

    setValue("category", newCategory.slug, { shouldValidate: true });
    setNewCatName("");
    setNewCatEmoji("🏷️");
    setNewCatColor("#10b981");
    setStep(1);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setRawAmount(raw);
    setValue("amount", Number(raw), { shouldValidate: !!raw });
  };

  useEffect(() => {
    if (type === "transfer") {
      setValue("category", "transfer", { shouldValidate: false });
      return;
    }

    if (!selectedCategory) return;

    const defaults = type === "income" ? categoryState.income : categoryState.expense;
    if (!defaults.some((category) => category.slug === selectedCategory)) {
      setValue("category", "", { shouldValidate: false });
    }
  }, [categoryState.expense, categoryState.income, selectedCategory, setValue, type]);

  const handleNextStep = async () => {
    const fields =
      type === "transfer"
        ? ["amount", "bankAccountId", "transferAccountId"] as const
        : ["amount", "bankAccountId"] as const;
    const ok = await trigger(fields);
    if (ok) setStep(1);
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const result =
      data.type === "transfer"
        ? await createTransferTransaction({
            name: data.name,
            amount: data.amount,
            date: data.date,
            notes: data.notes,
            from_bank_account_id: data.bankAccountId,
            to_bank_account_id: data.transferAccountId || "",
          })
        : await addTransaction({
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
      reset({ type: defaultType, date: new Date().toISOString().split("T")[0], transferAccountId: "" });
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

  const { defaults: categoryDefaults } = getAllCategories();
  const selectedBank = displayBankAccounts.find((b) => b.id === bankId);
  const selectedTransferBank = displayBankAccounts.find((b) => b.id === transferBankId);
  const isSelectedBankImgLogo = selectedBank?.logo?.startsWith("/");
  const isSelectedTransferBankImgLogo = selectedTransferBank?.logo?.startsWith("/");

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
                    Catatan {type === "income" ? "pemasukan" : type === "transfer" ? "transfer" : "pengeluaran"}{" "}
                    <span className="font-bold text-[var(--foreground)] tabular-nums">
                      {formatCurrency(Number(rawAmount))}
                    </span>{" "}
                    {type === "transfer" ? (
                      <>
                        berhasil dipindahkan dari{" "}
                        <span className="font-bold text-[var(--foreground)]">{selectedBank?.name}</span>
                        {" "}ke{" "}
                        <span className="font-bold text-[var(--foreground)]">{selectedTransferBank?.name}</span>
                      </>
                    ) : (
                      <>
                        telah tercatat pada dompet{" "}
                        <span className="font-bold text-[var(--foreground)]">{selectedBank?.name}</span>
                      </>
                    )}
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
                    <div className="grid grid-cols-3 gap-2 rounded-[1.35rem] border border-[var(--card-border)]/25 bg-[var(--muted)]/50 p-2">
                      <TypeButton active={field.value === "income"} onClick={() => field.onChange("income")} icon={<TrendingUp className="h-4 w-4" />} label={<><span className="block">Uang</span><span className="block">Masuk</span></>} activeClass="text-emerald-600 dark:text-emerald-400 bg-[var(--card)] border border-[var(--card-border)]/40 shadow-sm" />
                      <TypeButton active={field.value === "expense"} onClick={() => field.onChange("expense")} icon={<TrendingDown className="h-4 w-4" />} label={<><span className="block">Uang</span><span className="block">Keluar</span></>} activeClass="text-rose-600 dark:text-rose-400 bg-[var(--card)] border border-[var(--card-border)]/40 shadow-sm" />
                      <TypeButton active={field.value === "transfer"} onClick={() => field.onChange("transfer")} icon={<ArrowRightLeft className="h-4 w-4" />} label={<><span className="block">Pindah</span><span className="block">Dana</span></>} activeClass="text-teal-600 dark:text-teal-400 bg-[var(--card)] border border-[var(--card-border)]/40 shadow-sm" />
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
                  <Label className="text-xs font-semibold text-[var(--muted-foreground)]">
                    {type === "transfer" ? "Pilih Rekening Asal" : "Pilih Dompet / Rekening"}
                  </Label>
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

                {type === "transfer" && (
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-[var(--muted-foreground)]">Pilih Rekening Tujuan</Label>
                    <Controller
                      name="transferAccountId"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-2 gap-2">
                          {displayBankAccounts
                            .filter((account) => account.id !== bankId)
                            .map((account) => {
                              const isSelected = field.value === account.id;
                              const isImgLogo = account.logo?.startsWith("/");
                              return (
                                <button
                                  key={account.id}
                                  type="button"
                                  onClick={() => field.onChange(account.id)}
                                  className={cn(
                                    "relative flex items-center gap-2 rounded-2xl border px-3 py-3 text-left transition-all duration-150 select-none cursor-pointer min-h-[68px]",
                                    isSelected
                                      ? "border-teal-500 bg-teal-500/8 shadow-sm"
                                      : "border-[var(--card-border)] bg-[var(--muted)]/25 hover:bg-[var(--muted)]/60"
                                  )}
                                >
                                  <div className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--card-border)]/20 overflow-hidden",
                                    isSelected ? "bg-white shadow-sm" : "bg-[var(--card)]"
                                  )}>
                                    {isImgLogo ? (
                                      <img src={account.logo} alt={account.name} className="max-h-6 max-w-7 object-contain" />
                                    ) : (
                                      <span className="text-lg leading-none">{account.logo}</span>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className={cn("truncate text-xs font-bold", isSelected ? "text-teal-700 dark:text-teal-300" : "text-[var(--foreground)]")}>
                                      {account.name}
                                    </p>
                                    <p className="mt-0.5 truncate text-[10px] text-[var(--muted-foreground)] tabular-nums">
                                      {formatCurrency(account.balance, true)}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      )}
                    />
                    {errors.transferAccountId && (
                      <p className="text-[11px] text-rose-500 font-medium">{errors.transferAccountId.message}</p>
                    )}
                  </div>
                )}

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
                            {type === "transfer" ? "Saldo Rekening Asal" : "Sisa Saldo Saat Ini"}: {formatCurrency(selectedBank.balance, true)}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {type === "transfer" && selectedTransferBank && (
                  <div className="rounded-2xl border border-teal-500/15 bg-teal-500/5 p-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm border border-[var(--card-border)]/10 overflow-hidden",
                          isSelectedTransferBankImgLogo ? "bg-white p-1 shadow-sm" : ""
                        )}
                        style={!isSelectedTransferBankImgLogo ? { background: `linear-gradient(135deg, ${selectedTransferBank.gradient[0]}20, ${selectedTransferBank.gradient[1]}10)` } : undefined}
                      >
                        {isSelectedTransferBankImgLogo ? (
                          <img src={selectedTransferBank.logo} alt={selectedTransferBank.name} className="max-h-full max-w-full object-contain" />
                        ) : (
                          selectedTransferBank.logo
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-[var(--foreground)]">{selectedTransferBank.name}</p>
                        <p className="mt-0.5 text-[10px] font-medium text-[var(--muted-foreground)] tabular-nums">
                          Saldo Rekening Tujuan: {formatCurrency(selectedTransferBank.balance, true)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  size="lg"
                  onClick={handleNextStep}
                  className={cn(
                    "w-full h-11 text-xs font-bold rounded-2xl gap-1.5 mt-2 shadow-sm text-white cursor-pointer",
                    type === "income"
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : type === "transfer"
                        ? "bg-teal-600 hover:bg-teal-500"
                        : "bg-rose-600 hover:bg-rose-500"
                  )}
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
                      {type === "income" ? "Rencana Masuk" : type === "transfer" ? "Rencana Transfer" : "Rencana Keluar"} &bull; {selectedBank?.name}
                      {type === "transfer" && selectedTransferBank ? ` -> ${selectedTransferBank.name}` : ""}
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
                {type !== "transfer" && (
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
                            const isSelected = field.value === cat.slug;
                            return (
                              <button
                                key={`${cat.type}-${cat.slug}`}
                                type="button"
                                onClick={() => field.onChange(cat.slug)}
                                className={cn(
                                  "flex flex-col items-center justify-center gap-1 rounded-xl border py-2 px-1 text-center transition-all duration-150 select-none cursor-pointer min-h-[56px]",
                                  isSelected
                                    ? "border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm"
                                    : "border-[var(--card-border)] bg-[var(--muted)]/40 text-[var(--muted-foreground)] hover:bg-[var(--muted)]/80"
                                )}
                              >
                                <span className="text-base leading-none">{cat.emoji}</span>
                                <span className="text-[10px] leading-tight truncate w-full px-0.5">
                                  {cat.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  />
                  {errors.category && <p className="text-[11px] text-rose-500 font-medium">{errors.category.message}</p>}
                </div>
                )}

                {/* Responsive Date + Notes Row */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                    "w-full h-11 text-xs font-bold rounded-2xl gap-1.5 mt-2 text-white cursor-pointer shadow-sm transition-all",
                    type === "income"
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : type === "transfer"
                        ? "bg-teal-600 hover:bg-teal-500"
                        : "bg-rose-600 hover:bg-rose-500"
                  )}
                >
                  {isLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> <span>Sedang Menyimpan…</span></>
                  ) : (
                    <>{type === "transfer" ? <ArrowRightLeft className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />} <span>{type === "transfer" ? "Simpan Transfer" : "Simpan Transaksi"}</span></>
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
  active: boolean; onClick: () => void; icon: React.ReactNode; label: React.ReactNode; activeClass: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-[68px] flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-3 text-[11px] sm:min-h-[56px] sm:flex-row sm:gap-2 sm:px-3 sm:text-sm font-semibold transition-all duration-150 select-none cursor-pointer",
        active ? `${activeClass}` : "bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--card)]/45 hover:text-[var(--foreground)]"
      )}
    >
      <span className="shrink-0">{icon}</span>
      <span className="text-center leading-[1.1]">{label}</span>
    </button>
  );
}
