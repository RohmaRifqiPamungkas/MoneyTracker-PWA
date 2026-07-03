"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, CheckCircle2, Loader2, PencilLine } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { updateTransaction } from "@/app/actions";
import { CATEGORY_META } from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";
import type { BankAccountRow, TransactionRow } from "@/lib/supabase/types";

interface CustomCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

const STORAGE_KEY = "moneytracker_custom_categories";

const schema = z.object({
  amount: z.number().positive("Nominal harus lebih dari 0"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Pilih kategori"),
  name: z.string().min(2, "Nama transaksi min. 2 karakter").max(60),
  date: z.string().min(1, "Pilih tanggal"),
  notes: z.string().max(200).optional(),
  bank_account_id: z.string().min(1, "Pilih rekening"),
});

type FormValues = z.infer<typeof schema>;

const incomeCategories = ["salary", "freelance", "investment", "other"] as const;
const expenseCategories = ["food", "transport", "shopping", "bills", "entertainment", "health", "other"] as const;

function loadCustomCategories(): CustomCategory[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function getCategoryPresentation(category: string) {
  return CATEGORY_META[category] || { label: category, emoji: "🏷️", color: "#94a3b8" };
}

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionRow | null;
  bankAccounts: BankAccountRow[];
}

export function EditTransactionDialog({
  open,
  onOpenChange,
  transaction,
  bankAccounts,
}: EditTransactionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [rawAmount, setRawAmount] = useState("");
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);

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
  const selectedCategory = watch("category");

  useEffect(() => {
    if (!open) return;

    setCustomCategories(loadCustomCategories());
  }, [open]);

  useEffect(() => {
    if (!open || !transaction) return;

    reset({
      amount: transaction.amount,
      type: transaction.type === "income" ? "income" : "expense",
      category: transaction.category,
      name: transaction.name,
      date: transaction.date,
      notes: transaction.notes ?? "",
      bank_account_id: transaction.bank_account_id,
    });
    setRawAmount(String(transaction.amount));
    setErrorMsg("");
    setIsSuccess(false);
  }, [open, reset, transaction]);

  useEffect(() => {
    if (!selectedCategory) return;

    const defaults = type === "income" ? [...incomeCategories] : [...expenseCategories];
    const isCustomForType = selectedCategory.startsWith(`custom_${type}_`);

    if (!defaults.some((category) => category === selectedCategory) && !isCustomForType) {
      setValue("category", "", { shouldValidate: false });
    }
  }, [selectedCategory, setValue, type]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setRawAmount(raw);
    setValue("amount", Number(raw), { shouldValidate: true });
  };

  const handleDialogChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setErrorMsg("");
      setIsSuccess(false);
      setIsLoading(false);
    }

    onOpenChange(nextOpen);
  };

  const onSubmit = async (data: FormValues) => {
    if (!transaction) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      const result = await updateTransaction(transaction.id, data);

      if (!result.success) {
        setErrorMsg(result.error || "Gagal memperbarui transaksi");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setIsSuccess(true);

      window.setTimeout(() => {
        handleDialogChange(false);
      }, 1200);
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan. Coba lagi.");
      setIsLoading(false);
    }
  };

  const defaultCategories = type === "income" ? incomeCategories : expenseCategories;
  const typeCustomCategories = customCategories.filter((cat) => cat.id.startsWith(`custom_${type}_`));

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent showHandle className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PencilLine className="h-5 w-5 text-emerald-500" />
            Edit Riwayat Kas
          </DialogTitle>
          <DialogDescription>
            Perbarui detail transaksi tanpa menghilangkan sinkron saldo rekening dan budget.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 pb-8 pt-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>
            <div>
              <p className="font-semibold text-[var(--foreground)]">Transaksi berhasil diperbarui</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Nilai terbaru {formatCurrency(Number(rawAmount || 0), true)} sudah tersimpan.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 pb-6 pt-2">
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[var(--card-border)]/60 bg-[var(--muted)]/50 p-1">
                  <button
                    type="button"
                    onClick={() => field.onChange("income")}
                    className={cn(
                      "rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                      field.value === "income"
                        ? "bg-[var(--card)] text-emerald-600 shadow-sm"
                        : "text-[var(--muted-foreground)]"
                    )}
                  >
                    Pemasukan
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange("expense")}
                    className={cn(
                      "rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
                      field.value === "expense"
                        ? "bg-[var(--card)] text-rose-500 shadow-sm"
                        : "text-[var(--muted-foreground)]"
                    )}
                  >
                    Pengeluaran
                  </button>
                </div>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nama transaksi</Label>
                <Input id="edit-name" {...register("name")} placeholder="Contoh: Bayar listrik" />
                {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-date">Tanggal</Label>
                <Input id="edit-date" type="date" {...register("date")} />
                {errors.date && <p className="text-xs text-rose-500">{errors.date.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Nominal</Label>
                <Input
                  id="edit-amount"
                  inputMode="numeric"
                  value={rawAmount ? formatCurrency(Number(rawAmount)) : ""}
                  onChange={handleAmountChange}
                  placeholder="Rp 0"
                />
                {errors.amount && <p className="text-xs text-rose-500">{errors.amount.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Rekening</Label>
                <Controller
                  name="bank_account_id"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih rekening" />
                      </SelectTrigger>
                      <SelectContent>
                        {bankAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.bank_account_id && <p className="text-xs text-rose-500">{errors.bank_account_id.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kategori</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {defaultCategories.map((category) => {
                        const meta = getCategoryPresentation(category);
                        return (
                          <SelectItem key={category} value={category}>
                            <span className="flex items-center gap-2">
                              <span>{meta.emoji}</span>
                              <span>{meta.label}</span>
                            </span>
                          </SelectItem>
                        );
                      })}
                      {typeCustomCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <span className="flex items-center gap-2">
                            <span>{category.emoji}</span>
                            <span>{category.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && <p className="text-xs text-rose-500">{errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Catatan</Label>
              <Textarea
                id="edit-notes"
                {...register("notes")}
                rows={3}
                placeholder="Tambahkan catatan singkat jika perlu"
              />
              {errors.notes && <p className="text-xs text-rose-500">{errors.notes.message}</p>}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => handleDialogChange(false)}>
                Batal
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
