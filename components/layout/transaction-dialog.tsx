"use client";

import { useState } from "react";
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
import { CATEGORY_META, BANK_ACCOUNTS } from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";

/* ── Zod schema ─────────────────────────────────────────── */
const schema = z.object({
  amount:        z.number().positive("Nominal harus lebih dari 0"),
  type:          z.enum(["income", "expense"]),
  bankAccountId: z.string().min(1, "Pilih rekening"),
  category:      z.enum([
    "food", "transport", "shopping", "bills", "entertainment",
    "health", "salary", "freelance", "investment", "other",
  ]),
  name:  z.string().min(2, "Min. 2 karakter").max(60),
  date:  z.string().min(1, "Pilih tanggal"),
  notes: z.string().max(200).optional(),
});

type FormValues = z.infer<typeof schema>;

const incomeCategories  = ["salary", "freelance", "investment", "other"]                             as const;
const expenseCategories = ["food", "transport", "shopping", "bills", "entertainment", "health", "other"] as const;

/* ── Props ──────────────────────────────────────────────── */
interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultType?: "income" | "expense";
}

/* ── Step indicator ─────────────────────────────────────── */
function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mb-4">
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
  );
}

export function TransactionDialog({
  open,
  onOpenChange,
  defaultType = "expense",
}: TransactionDialogProps) {
  const [step, setStep]         = useState(0); // 0=amount+bank, 1=details, 2=success
  const [isLoading, setLoading] = useState(false);
  const [rawAmount, setRawAmount] = useState("");

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

  const type   = watch("type");
  const bankId = watch("bankAccountId");

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setRawAmount(raw);
    setValue("amount", Number(raw), { shouldValidate: !!raw });
  };

  /* Step 1 → Step 2: validate amount + bank first */
  const handleNextStep = async () => {
    const ok = await trigger(["amount", "bankAccountId"]);
    if (ok) setStep(1);
  };

  const onSubmit = async (_data: FormValues) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setStep(2);
    setTimeout(() => {
      handleOpenChange(false);
    }, 2000);
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      reset({ type: defaultType, date: new Date().toISOString().split("T")[0] });
      setRawAmount("");
      setStep(0);
    }
    onOpenChange(v);
  };

  const categoryOptions = type === "income" ? incomeCategories : expenseCategories;
  const selectedBank    = BANK_ACCOUNTS.find((b) => b.id === bankId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showHandle>
        {/* Header */}
        <DialogHeader className="pt-5 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <Wallet className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <DialogTitle>Tambah Transaksi</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {step === 0 ? "Nominal & rekening sumber" : "Detail transaksi"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="wait">

            {/* ── Step 2: success ─────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="flex flex-col items-center justify-center py-10 gap-4"
              >
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-lg font-semibold text-[var(--foreground)]">Transaksi Disimpan! 🎉</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {type === "income" ? "Pemasukan" : "Pengeluaran"}{" "}
                    <span className="font-semibold text-[var(--foreground)]">
                      {formatCurrency(Number(rawAmount))}
                    </span>{" "}
                    {type === "income" ? "masuk ke" : "keluar dari"}{" "}
                    <span className="font-semibold" style={{ color: selectedBank?.color }}>
                      {selectedBank?.name ?? "rekening"}
                    </span>
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── Step 0: amount + bank ────────────────────── */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5 pt-1"
              >
                <StepDots total={2} current={0} />

                {/* Type toggle */}
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <div className="flex rounded-2xl bg-[var(--muted)] p-1 gap-1">
                      <TypeButton active={field.value === "income"}  onClick={() => field.onChange("income")}  icon={<TrendingUp  className="h-4 w-4" />} label="Pemasukan"   activeClass="text-emerald-600 bg-[var(--card)]" />
                      <TypeButton active={field.value === "expense"} onClick={() => field.onChange("expense")} icon={<TrendingDown className="h-4 w-4" />} label="Pengeluaran" activeClass="text-rose-600 bg-[var(--card)]" />
                    </div>
                  )}
                />

                {/* Amount */}
                <div className="space-y-1.5">
                  <Label htmlFor="d-amount" className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                    Nominal
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-semibold text-[var(--muted-foreground)]">
                      Rp
                    </span>
                    <Input
                      id="d-amount"
                      inputMode="numeric"
                      placeholder="0"
                      value={rawAmount ? Number(rawAmount).toLocaleString("id-ID") : ""}
                      onChange={handleAmountChange}
                      className="h-14 pl-10 text-right text-xl font-bold rounded-xl border-2 focus:border-emerald-500"
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-xs text-rose-500">{errors.amount.message}</p>
                  )}
                </div>

                {/* Bank account picker */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                    {type === "income" ? "Masuk ke Rekening" : "Keluar dari Rekening"}
                  </Label>
                  <Controller
                    name="bankAccountId"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 min-[380px]:grid-cols-3 gap-2">
                        {BANK_ACCOUNTS.map((account) => {
                          const isSelected = field.value === account.id;
                          return (
                            <button
                              key={account.id}
                              type="button"
                              onClick={() => field.onChange(account.id)}
                              className={cn(
                                "relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition-all duration-150 overflow-hidden",
                                isSelected
                                  ? "border-transparent shadow-md"
                                  : "border-[var(--card-border)] hover:border-[var(--muted-foreground)]/40 bg-[var(--muted)]/40"
                              )}
                              style={
                                isSelected
                                  ? { background: `linear-gradient(135deg, ${account.gradient[0]}, ${account.gradient[1]})` }
                                  : {}
                              }
                            >
                              <span className="text-xl leading-none">{account.logo}</span>
                              <span
                                className={cn(
                                  "text-[10px] font-semibold leading-tight",
                                  isSelected ? "text-white" : "text-[var(--muted-foreground)]"
                                )}
                              >
                                {account.name}
                              </span>
                              {isSelected && (
                                <span className="text-[9px] text-white/70 font-medium">
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
                    <p className="text-xs text-rose-500">{errors.bankAccountId.message}</p>
                  )}
                </div>

                {/* Selected bank summary */}
                <AnimatePresence>
                  {selectedBank && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      className="flex items-center gap-3 rounded-xl p-3 border border-[var(--card-border)] bg-[var(--muted)]/50"
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base"
                        style={{ background: `linear-gradient(135deg, ${selectedBank.gradient[0]}30, ${selectedBank.gradient[1]}20)` }}
                      >
                        {selectedBank.logo}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--foreground)] truncate">{selectedBank.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Saldo: {formatCurrency(selectedBank.balance, true)}
                          {selectedBank.accountNumber && ` · •••• ${selectedBank.accountNumber}`}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="button"
                  size="lg"
                  onClick={handleNextStep}
                  className="w-full rounded-xl gap-2"
                >
                  Lanjut ke Detail
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {/* ── Step 1: details ──────────────────────────── */}
            {step === 1 && (
              <motion.form
                key="step1"
                onSubmit={handleSubmit(onSubmit)}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-5 pt-1"
              >
                <StepDots total={2} current={1} />

                {/* Recap pill */}
                <div className="flex items-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--muted)]/50 p-3">
                  <span className="text-lg">{selectedBank?.logo}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {type === "income" ? "Masuk ke" : "Keluar dari"} {selectedBank?.name}
                    </p>
                    <p className="text-base font-bold text-[var(--foreground)]">
                      {formatCurrency(Number(rawAmount))}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Transaction name */}
                <div className="space-y-1.5">
                  <Label htmlFor="d-name" className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                    Nama Transaksi
                  </Label>
                  <Input
                    id="d-name"
                    placeholder="Mis. Makan Siang, Gaji Bulanan…"
                    className="h-11 rounded-xl"
                    {...register("name")}
                  />
                  {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
                </div>

                {/* Category grid */}
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Kategori</Label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-3 min-[400px]:grid-cols-4 gap-2">
                        {categoryOptions.map((cat) => {
                          const meta = CATEGORY_META[cat];
                          const isSelected = field.value === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => field.onChange(cat)}
                              className={cn(
                                "flex flex-col items-center gap-1.5 rounded-xl border-2 p-2.5 text-center transition-all duration-150",
                                isSelected
                                  ? "border-emerald-500 bg-emerald-500/8"
                                  : "border-[var(--card-border)] hover:border-[var(--muted-foreground)]/40 bg-[var(--muted)]/50"
                              )}
                            >
                              <span className="text-xl leading-none">{meta.emoji}</span>
                              <span className={cn("text-[10px] font-medium leading-tight", isSelected ? "text-emerald-600" : "text-[var(--muted-foreground)]")}>
                                {meta.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />
                  {errors.category && <p className="text-xs text-rose-500">{errors.category.message}</p>}
                </div>

                {/* Date + Notes */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="d-date" className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Tanggal</Label>
                    <Input id="d-date" type="date" className="h-11 rounded-xl" {...register("date")} />
                    {errors.date && <p className="text-xs text-rose-500">{errors.date.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="d-notes" className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Catatan</Label>
                    <Textarea id="d-notes" placeholder="Opsional…" rows={1} className="h-11 rounded-xl resize-none py-2.5" {...register("notes")} />
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className={cn(
                    "w-full rounded-xl text-base font-semibold",
                    type === "income" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"
                  )}
                >
                  {isLoading ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Menyimpan…</>
                  ) : (
                    <><PlusCircle className="h-5 w-5" /> Simpan Transaksi</>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── TypeButton helper ──────────────────────────────────── */
function TypeButton({ active, onClick, icon, label, activeClass }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string; activeClass: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-all duration-150",
        active ? `${activeClass} shadow-sm` : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      )}
    >
      {icon}{label}
    </button>
  );
}
