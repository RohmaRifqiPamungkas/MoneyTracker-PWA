"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, PlusCircle, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_META } from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";
import { addTransaction } from "@/app/actions";
import type { BankAccountRow } from "@/lib/supabase/types";

const schema = z.object({
  amount: z.number().positive("Nominal harus lebih dari 0"),
  type: z.enum(["income", "expense"]),
  category: z.enum([
    "food", "transport", "shopping", "bills", "entertainment",
    "health", "salary", "freelance", "investment", "other",
  ]),
  name: z.string().min(2, "Nama transaksi min. 2 karakter").max(60),
  date: z.string().min(1, "Pilih tanggal"),
  notes: z.string().max(200).optional(),
  bank_account_id: z.string().min(1, "Pilih rekening"),
});

type FormValues = z.infer<typeof schema>;

const incomeCategories = ["salary", "freelance", "investment", "other"] as const;
const expenseCategories = ["food", "transport", "shopping", "bills", "entertainment", "health", "other"] as const;

export function QuickTransactionForm({ bankAccounts }: { bankAccounts: BankAccountRow[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [rawAmount, setRawAmount] = useState("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "expense",
      date: new Date().toISOString().split("T")[0],
      bank_account_id: bankAccounts[0]?.id ?? "",
    },
  });

  const type = watch("type");

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setRawAmount(raw);
    setValue("amount", Number(raw), { shouldValidate: true });
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const result = await addTransaction({
        name: data.name,
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: data.date,
        notes: data.notes,
        bank_account_id: data.bank_account_id,
      });

      if (!result.success) {
        setErrorMsg(result.error || "Gagal menyimpan transaksi");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        reset({
          type: "expense",
          date: new Date().toISOString().split("T")[0],
          bank_account_id: bankAccounts[0]?.id ?? "",
        });
        setRawAmount("");
      }, 2000);
    } catch (err) {
      setErrorMsg("Terjadi kesalahan jaringan. Coba lagi.");
      setIsLoading(false);
    }
  };

  const categoryOptions = type === "income" ? incomeCategories : expenseCategories;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PlusCircle className="h-4 w-4 text-emerald-500" />
            Tambah Transaksi
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center justify-center py-8 gap-3"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                </div>
                <p className="font-semibold text-[var(--foreground)]">Transaksi Ditambahkan!</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {formatCurrency(Number(rawAmount))} berhasil disimpan
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Error banner */}
                {errorMsg && (
                  <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-sm text-rose-600">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {errorMsg}
                  </div>
                )}

                {/* Segmented Control – Type */}
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <div className="flex rounded-xl bg-[var(--muted)] p-1 gap-1">
                      <button
                        type="button"
                        onClick={() => field.onChange("income")}
                        className={cn(
                          "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all duration-150",
                          field.value === "income"
                            ? "bg-[var(--card)] text-emerald-600 shadow-sm"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        )}
                      >
                        <TrendingUp className="h-3.5 w-3.5" />
                        Pemasukan
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange("expense")}
                        className={cn(
                          "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all duration-150",
                          field.value === "expense"
                            ? "bg-[var(--card)] text-rose-600 shadow-sm"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        )}
                      >
                        <TrendingDown className="h-3.5 w-3.5" />
                        Pengeluaran
                      </button>
                    </div>
                  )}
                />

                {/* Amount */}
                <div className="space-y-1.5">
                  <Label htmlFor="amount">Nominal</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--muted-foreground)]">
                      Rp
                    </span>
                    <Input
                      id="amount"
                      inputMode="numeric"
                      placeholder="0"
                      value={rawAmount ? Number(rawAmount).toLocaleString("id-ID") : ""}
                      onChange={handleAmountChange}
                      className="pl-9 text-right font-semibold text-base"
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-xs text-rose-500">{errors.amount.message}</p>
                  )}
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="name">Nama Transaksi</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Makan Siang, Gaji Bulanan"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-rose-500">{errors.name.message}</p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <Label>Kategori</Label>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori..." />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((cat) => {
                            const meta = CATEGORY_META[cat];
                            return (
                              <SelectItem key={cat} value={cat}>
                                <span className="flex items-center gap-2">
                                  <span>{meta.emoji}</span>
                                  <span>{meta.label}</span>
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.category && (
                    <p className="text-xs text-rose-500">{errors.category.message}</p>
                  )}
                </div>

                {/* Bank Account */}
                <div className="space-y-1.5">
                  <Label>Rekening</Label>
                  <Controller
                    name="bank_account_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih rekening..." />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              <span className="flex items-center gap-2">
                                <span>{account.logo}</span>
                                <span>{account.name}</span>
                                <span className="text-[var(--muted-foreground)] text-xs ml-auto">
                                  {formatCurrency(account.balance, true)}
                                </span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.bank_account_id && (
                    <p className="text-xs text-rose-500">{errors.bank_account_id.message}</p>
                  )}
                </div>

                {/* Date */}
                <div className="space-y-1.5">
                  <Label htmlFor="date">Tanggal</Label>
                  <Input id="date" type="date" {...register("date")} />
                  {errors.date && (
                    <p className="text-xs text-rose-500">{errors.date.message}</p>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <Label htmlFor="notes">
                    Catatan{" "}
                    <span className="text-[var(--muted-foreground)] font-normal">(opsional)</span>
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Tambahkan catatan..."
                    rows={2}
                    {...register("notes")}
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                  variant={type === "income" ? "default" : "destructive"}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4" />
                      Tambah {type === "income" ? "Pemasukan" : "Pengeluaran"}
                    </>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
