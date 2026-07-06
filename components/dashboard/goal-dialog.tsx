"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
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
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{goal ? "Edit Target Tabungan" : "Tambah Target Baru"}</DialogTitle>
            <DialogDescription>
              {goal ? "Perbarui jumlah uang terkumpul atau target." : "Buat target finansial baru Anda."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emoji" className="text-right text-xs">Emoji</Label>
              <Input
                id="emoji"
                value={formData.emoji}
                onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
                className="col-span-1 text-center"
                maxLength={2}
              />
              <div className="col-span-2 text-[10px] text-[var(--muted-foreground)] leading-tight">
                Gunakan emoji (opsional)
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-xs">Nama Target</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Mis: Dana Darurat, Beli Laptop"
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target_amount" className="text-right text-xs">Target Rp</Label>
              <Input
                id="target_amount"
                value={formatRupiah(formData.target_amount)}
                onChange={(e) => handleAmountChange("target_amount", e.target.value)}
                placeholder="5.000.000"
                className="col-span-3 font-mono"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="current_amount" className="text-right text-xs">Terkumpul Rp</Label>
              <Input
                id="current_amount"
                value={formatRupiah(formData.current_amount)}
                onChange={(e) => handleAmountChange("current_amount", e.target.value)}
                placeholder="1.000.000"
                className="col-span-3 font-mono"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target_date" className="text-right text-xs">Tenggat</Label>
              <Input
                id="target_date"
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
                className="col-span-3"
              />
            </div>

            {error && <p className="text-sm font-medium text-rose-500 mt-2">{error}</p>}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {goal && (
              <Button 
                type="button" 
                variant="destructive" 
                className="w-full sm:w-auto" 
                onClick={handleDelete}
                disabled={loading || deleting}
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Hapus
              </Button>
            )}
            <div className="flex-1" />
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading || deleting}>
              Batal
            </Button>
            <Button type="submit" disabled={loading || deleting}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {goal ? "Simpan Perubahan" : "Buat Target"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
