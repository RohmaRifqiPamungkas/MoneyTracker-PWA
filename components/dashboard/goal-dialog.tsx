"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } from "@/app/actions";
import type { SavingsGoalRow } from "@/lib/supabase/types";
import { Loader2, Trash2 } from "lucide-react";

interface GoalDialogProps {
  goal: SavingsGoalRow | null; // null for add mode
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoalDialog({ goal, open, onOpenChange }: GoalDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
    current_amount: "0",
    target_date: "",
    emoji: "🎯",
  });

  // Reset or populate form when dialog opens
  useEffect(() => {
    if (open) {
      setError(null);
      if (goal) {
        setFormData({
          name: goal.name,
          target_amount: goal.target_amount.toString(),
          current_amount: goal.current_amount.toString(),
          target_date: goal.target_date,
          emoji: goal.emoji,
        });
      } else {
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        setFormData({
          name: "",
          target_amount: "",
          current_amount: "0",
          target_date: nextYear.toISOString().slice(0, 10),
          emoji: "🎯",
        });
      }
    }
  }, [open, goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const values = {
      name: formData.name,
      target_amount: Number(formData.target_amount.replace(/[^0-9]/g, "")),
      current_amount: Number(formData.current_amount.replace(/[^0-9]/g, "")),
      target_date: formData.target_date,
      emoji: formData.emoji,
    };

    if (!values.name || !values.target_amount || !values.target_date) {
      setError("Mohon lengkapi semua field yang wajib.");
      setLoading(false);
      return;
    }

    try {
      let res;
      if (goal) {
        res = await updateSavingsGoal(goal.id, values);
      } else {
        res = await addSavingsGoal(values);
      }

      if (!res.success) {
        throw new Error(res.error || "Terjadi kesalahan.");
      }

      onOpenChange(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!goal || !window.confirm("Apakah Anda yakin ingin menghapus target ini?")) return;
    
    setDeleting(true);
    setError(null);
    try {
      const res = await deleteSavingsGoal(goal.id);
      if (!res.success) {
        throw new Error(res.error || "Gagal menghapus.");
      }
      onOpenChange(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleAmountChange = (key: "target_amount" | "current_amount", value: string) => {
    const raw = value.replace(/[^0-9]/g, "");
    setFormData(prev => ({ ...prev, [key]: raw }));
  };

  const formatRupiah = (val: string) => {
    if (!val) return "";
    return new Intl.NumberFormat("id-ID").format(Number(val));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showHandle className="p-0 overflow-hidden rounded-t-[1.75rem] sm:rounded-2xl transition-all duration-200 max-w-md">
        <DialogHeader className="p-5 pb-3 border-b border-[var(--card-border)]/40 text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <span className="text-xl leading-none">{formData.emoji || "🎯"}</span>
            </div>
            <div>
              <DialogTitle className="text-sm sm:text-base font-bold">
                {goal ? "Edit Target Tabungan" : "Tambah Target Baru"}
              </DialogTitle>
              <DialogDescription className="text-[11px] sm:text-xs mt-0.5 opacity-80">
                {goal ? "Perbarui jumlah uang terkumpul atau target." : "Buat target finansial baru Anda."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-5 pt-4 pb-0 overflow-y-auto max-h-[76vh] sm:max-h-[550px] custom-scrollbar">
          <div className="space-y-4 pt-0.5 pb-2">
            
            {/* Emoji and Name Row */}
            <div className="flex gap-2">
              <div className="space-y-1.5 w-[72px] shrink-0">
                <Label htmlFor="emoji" className="text-xs font-semibold text-[var(--muted-foreground)]">Emoji</Label>
                <Input
                  id="emoji"
                  value={formData.emoji}
                  onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
                  className="h-10 text-xl text-center rounded-xl"
                  maxLength={2}
                />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <Label htmlFor="name" className="text-xs font-semibold text-[var(--muted-foreground)]">Nama Target</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Mis: Dana Darurat, Beli Laptop"
                  className="h-10 text-sm rounded-xl"
                />
              </div>
            </div>

            {/* Target Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="target_amount" className="text-xs font-semibold text-[var(--muted-foreground)]">Target Nominal</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--muted-foreground)]">
                  Rp
                </span>
                <Input
                  id="target_amount"
                  inputMode="numeric"
                  value={formatRupiah(formData.target_amount)}
                  onChange={(e) => handleAmountChange("target_amount", e.target.value)}
                  placeholder="5.000.000"
                  className="h-12 pl-10 pr-4 text-right font-bold text-lg rounded-xl border border-[var(--card-border)] focus-visible:ring-1 focus-visible:ring-[var(--ring)] tabular-nums"
                />
              </div>
            </div>

            {/* Current Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="current_amount" className="text-xs font-semibold text-[var(--muted-foreground)]">Uang Terkumpul</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--muted-foreground)]">
                  Rp
                </span>
                <Input
                  id="current_amount"
                  inputMode="numeric"
                  value={formatRupiah(formData.current_amount)}
                  onChange={(e) => handleAmountChange("current_amount", e.target.value)}
                  placeholder="1.000.000"
                  className="h-12 pl-10 pr-4 text-right font-bold text-lg rounded-xl border border-[var(--card-border)] focus-visible:ring-1 focus-visible:ring-[var(--ring)] tabular-nums"
                />
              </div>
            </div>

            {/* Target Date */}
            <div className="space-y-1.5">
              <Label htmlFor="target_date" className="text-xs font-semibold text-[var(--muted-foreground)]">Tenggat Target</Label>
              <Input
                id="target_date"
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
                className="h-10 text-sm rounded-xl"
              />
            </div>

            {error && <p className="text-[11px] font-medium text-rose-500 mt-2">{error}</p>}
          </div>

          <div className="sticky bottom-0 -mx-5 px-5 pt-3 pb-4 bg-background border-t border-[var(--card-border)]/60 shadow-[0_-12px_24px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_-12px_24px_-4px_rgba(0,0,0,0.2)] z-10 mt-4 flex flex-col sm:flex-row gap-2">
            {goal && (
              <Button 
                type="button" 
                variant="destructive" 
                className="w-full sm:w-auto h-11 rounded-2xl font-bold" 
                onClick={handleDelete}
                disabled={loading || deleting}
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Hapus
              </Button>
            )}
            <div className="flex-1 hidden sm:block" />
            <Button 
              type="submit" 
              className="w-full sm:w-auto h-11 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white" 
              disabled={loading || deleting}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {goal ? "Simpan Perubahan" : "Buat Target"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
