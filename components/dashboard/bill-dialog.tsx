"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addUpcomingBill, updateUpcomingBill, deleteUpcomingBill } from "@/app/actions";
import type { UpcomingBillRow } from "@/lib/supabase/types";
import { Loader2, Trash2 } from "lucide-react";
import { AnimatedEmoji } from "@/components/ui/animated-emoji";

interface BillDialogProps {
  bill: UpcomingBillRow | null; // null for add mode
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BillDialog({ bill, open, onOpenChange }: BillDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    due_date: "",
    category: "tagihan", // Default
    emoji: "📄",
  });

  // Reset or populate form when dialog opens
  useEffect(() => {
    if (open) {
      setError(null);
      if (bill) {
        setFormData({
          name: bill.name,
          amount: bill.amount.toString(),
          due_date: bill.due_date,
          category: bill.category,
          emoji: bill.emoji,
        });
      } else {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        setFormData({
          name: "",
          amount: "",
          due_date: nextWeek.toISOString().slice(0, 10),
          category: "tagihan",
          emoji: "📄",
        });
      }
    }
  }, [open, bill]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const values = {
      name: formData.name,
      amount: Number(formData.amount.replace(/[^0-9]/g, "")),
      due_date: formData.due_date,
      category: formData.category,
      emoji: formData.emoji,
    };

    if (!values.name || !values.amount || !values.due_date) {
      setError("Mohon lengkapi semua field yang wajib.");
      setLoading(false);
      return;
    }

    try {
      let res;
      if (bill) {
        res = await updateUpcomingBill(bill.id, values);
      } else {
        res = await addUpcomingBill(values);
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
    if (!bill || !window.confirm("Apakah Anda yakin ingin menghapus tagihan ini?")) return;
    
    setDeleting(true);
    setError(null);
    try {
      const res = await deleteUpcomingBill(bill.id);
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

  const handleAmountChange = (value: string) => {
    const raw = value.replace(/[^0-9]/g, "");
    setFormData(prev => ({ ...prev, amount: raw }));
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <AnimatedEmoji emoji={formData.emoji || "📄"} size={24} />
            </div>
            <div>
              <DialogTitle className="text-sm sm:text-base font-bold">
                {bill ? "Edit Tagihan Mendatang" : "Tambah Tagihan Baru"}
              </DialogTitle>
              <DialogDescription className="text-[11px] sm:text-xs mt-0.5 opacity-80">
                {bill ? "Perbarui jumlah atau tenggat tagihan." : "Catat tagihan agar tidak terlupa."}
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
                <Label htmlFor="name" className="text-xs font-semibold text-[var(--muted-foreground)]">Nama Tagihan</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Mis: Cicilan Rumah, Listrik"
                  className="h-10 text-sm rounded-xl"
                />
              </div>
            </div>

            {/* Target Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-xs font-semibold text-[var(--muted-foreground)]">Nominal Tagihan</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--muted-foreground)]">
                  Rp
                </span>
                <Input
                  id="amount"
                  inputMode="numeric"
                  value={formatRupiah(formData.amount)}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="1.000.000"
                  className="h-12 pl-10 pr-4 text-right font-bold text-lg rounded-xl border border-[var(--card-border)] focus-visible:ring-1 focus-visible:ring-[var(--ring)] tabular-nums"
                />
              </div>
            </div>

            {/* Target Date */}
            <div className="space-y-1.5">
              <Label htmlFor="due_date" className="text-xs font-semibold text-[var(--muted-foreground)]">Jatuh Tempo</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className="h-10 text-sm rounded-xl"
              />
            </div>

            {error && <p className="text-[11px] font-medium text-rose-500 mt-2">{error}</p>}
          </div>

          <div className="sticky bottom-0 -mx-5 px-5 pt-3 pb-4 bg-background border-t border-[var(--card-border)]/60 shadow-[0_-12px_24px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_-12px_24px_-4px_rgba(0,0,0,0.2)] z-10 mt-4 flex flex-col sm:flex-row gap-2">
            {bill && (
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
              className="w-full sm:w-auto h-11 rounded-2xl font-bold bg-blue-600 hover:bg-blue-500 text-white" 
              disabled={loading || deleting}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {bill ? "Simpan Perubahan" : "Simpan Tagihan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
