"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Trash2,
  Download,
  Calendar,
  ArrowLeft,
  FilterX,
  SlidersHorizontal,
  X,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_META } from "@/lib/mock-data";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { removeTransaction } from "@/app/actions";
import type { TransactionRow, BankAccountRow } from "@/lib/supabase/types";
import type { TransactionType, Category } from "@/lib/types";

const PAGE_SIZE = 10;

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

interface TransactionsClientProps {
  initialTransactions: TransactionRow[];
  bankAccounts: BankAccountRow[];
  currentMonth: number;
  currentYear: number;
}

export function TransactionsClient({
  initialTransactions,
  bankAccounts,
  currentMonth: initialMonth,
  currentYear: initialYear,
}: TransactionsClientProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [currentYear, setCurrentYear] = useState(initialYear);

  // Update state when props change (e.g., via URL navigation)
  useEffect(() => {
    setCurrentMonth(initialMonth);
    setCurrentYear(initialYear);
  }, [initialMonth, initialYear]);

  // Fungsi untuk update query params URL saat dropdown diganti
  const handlePeriodChange = (month: number, year: number) => {
    router.push(`/dashboard/transactions?month=${month}&year=${year}`);
  };

  const BANK_MAP = useMemo(() => {
    return Object.fromEntries(bankAccounts.map((b) => [b.id, b]));
  }, [bankAccounts]);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [bankFilter, setBankFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date_desc" | "date_asc" | "amount_desc" | "amount_asc">("date_desc");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // State laci filter mobile
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const handleFilterChange = (setter: (v: any) => void, val: any) => {
    setter(val);
    setPage(1);
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...initialTransactions];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.name.toLowerCase().includes(q) ||
          (tx.notes && tx.notes.toLowerCase().includes(q))
      );
    }

    if (typeFilter !== "all") result = result.filter((tx) => tx.type === typeFilter);
    if (categoryFilter !== "all") result = result.filter((tx) => tx.category === categoryFilter);
    if (bankFilter !== "all") result = result.filter((tx) => tx.bank_account_id === bankFilter);

    result.sort((a, b) => {
      if (sortBy === "date_desc") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "date_asc") return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "amount_desc") return b.amount - a.amount;
      if (sortBy === "amount_asc") return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [initialTransactions, search, typeFilter, categoryFilter, bankFilter, sortBy]);

  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredAndSorted.forEach((tx) => {
      if (tx.type === "income") income += tx.amount;
      else expense += tx.amount;
    });
    return { income, expense, net: income - expense };
  }, [filteredAndSorted]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  const paginatedTransactions = useMemo(() => {
    return filteredAndSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filteredAndSorted, page]);

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    if (!confirm("Hapus transaksi ini secara permanen?")) return;

    setDeletingId(id);
    try {
      const res = await removeTransaction(id);
      if (res && !res.success) alert(res.error || "Gagal menghapus");
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = () => {
    if (filteredAndSorted.length === 0) return alert("Data kosong");
    const headers = ["Tanggal", "Nama Transaksi", "Jenis", "Kategori", "Rekening", "Nominal", "Catatan"];
    const rows = filteredAndSorted.map((tx) => [
      tx.date,
      `"${tx.name.replace(/"/g, '""')}"`,
      tx.type === "income" ? "Masuk" : "Keluar",
      CATEGORY_META[tx.category]?.label || tx.category,
      `"${(BANK_MAP[tx.bank_account_id]?.name || "Cash").replace(/"/g, '""')}"`,
      tx.amount,
      `"${(tx.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `Laporan_ArusKas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAllFilters = () => {
    setSearch(""); setTypeFilter("all"); setCategoryFilter("all"); setBankFilter("all"); setSortBy("date_desc"); setPage(1);
  };

  const hasActiveFilters = search || typeFilter !== "all" || categoryFilter !== "all" || bankFilter !== "all" || sortBy !== "date_desc";

  return (
    <div className="min-h-screen bg-[var(--background)] pb-32">
      {/* ── JUMBO PREMIUM HEADER ─────────────────────────────── */}
      <div className="w-full bg-gradient-to-b from-[var(--muted)]/50 to-transparent border-b border-[var(--card-border)]/40 px-4 pt-5 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-xl flex flex-col gap-5">
          {/* Header Row: Title + Export */}
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
                  Riwayat Kas
                </h1>
                <p className="text-[11px] text-[var(--muted-foreground)] truncate hidden xs:block">
                  Total {filteredAndSorted.length} catatan transaksi terekam
                </p>
              </div>
            </div>

            <Button onClick={handleExportCSV} variant="ghost" size="sm" className="h-9 rounded-xl gap-2 font-medium bg-[var(--card)] border border-[var(--card-border)]/60 shadow-sm text-xs px-3">
              <Download className="h-3.5 w-3.5 text-emerald-500" />
              <span>Export</span>
            </Button>
          </div>

          {/* Periode Selector */}
          <div className="flex flex-wrap items-center gap-2 sm:w-auto w-full">
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

          {/* Minimalist Net Summary Box Layout */}
          {/* Highly Responsive Net Summary Box Layout */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3 bg-[var(--card)] border border-[var(--card-border)]/50 p-1.5 sm:p-3.5 rounded-2xl shadow-sm/5 relative overflow-hidden">
            {/* Masuk */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 py-2 px-1 border-r border-[var(--card-border)]/30 group/stat hover:bg-[var(--muted)]/30 rounded-xl transition-colors duration-150 min-w-0">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <div className="text-center sm:text-left min-w-0 w-full sm:w-auto">
                <p className="text-[9px] sm:text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider leading-none">Masuk</p>
                <p className="text-[11px] sm:text-base font-bold text-emerald-500 mt-1 sm:mt-1.5 tabular-nums truncate">
                  {formatCurrency(stats.income, true)}
                </p>
              </div>
            </div>

            {/* Keluar */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 py-2 px-1 border-r border-[var(--card-border)]/30 group/stat hover:bg-[var(--muted)]/30 rounded-xl transition-colors duration-150 min-w-0">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500 shrink-0">
                <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <div className="text-center sm:text-left min-w-0 w-full sm:w-auto">
                <p className="text-[9px] sm:text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider leading-none">Keluar</p>
                <p className="text-[11px] sm:text-base font-bold text-rose-500 mt-1 sm:mt-1.5 tabular-nums truncate">
                  {formatCurrency(stats.expense, true)}
                </p>
              </div>
            </div>

            {/* Net */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 py-2 px-1 group/stat hover:bg-[var(--muted)]/30 rounded-xl transition-colors duration-150 min-w-0">
              <div className={cn(
                "flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg shrink-0",
                stats.net >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
              )}>
                <ArrowUpDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <div className="text-center sm:text-left min-w-0 w-full sm:w-auto">
                <p className="text-[9px] sm:text-[10px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider leading-none">Net Bersih</p>
                <p className={cn(
                  "text-[11px] sm:text-base font-bold mt-1 sm:mt-1.5 tabular-nums truncate block w-full sm:w-auto",
                  stats.net >= 0 ? "text-emerald-500" : "text-rose-500"
                )}>
                  {stats.net > 0 ? "+" : ""}{formatCurrency(stats.net, true)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 mt-4 space-y-4">
        {/* ── SEARCH BAR + ADVANCED FILTER TOGGLE ──────────────── */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)] opacity-70" />
            <Input
              placeholder="Cari transaksi berdasarkan nama/catatan..."
              value={search}
              onChange={(e) => handleFilterChange(setSearch, e.target.value)}
              className="pl-10 pr-4 bg-[var(--card)] border-[var(--card-border)]/80 focus-visible:ring-1 focus-visible:ring-[var(--ring)] h-11 text-xs sm:text-sm rounded-xl w-full shadow-sm/5"
            />
          </div>

          {/* Mobile Filter Anchor Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsFilterDrawerOpen(true)}
            className={cn(
              "lg:hidden h-11 px-4 rounded-xl gap-2 text-xs font-bold shrink-0 shadow-sm bg-[var(--card)] cursor-pointer",
              hasActiveFilters && "border-emerald-500 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden xs:inline">Filter</span>
          </Button>
        </div>

        {/* ── DESKTOP PERSISTENT INLINE FILTER ─────────────────── */}
        <Card className="hidden lg:block border-[var(--card-border)] bg-[var(--card)]/60 shadow-none">
          <CardContent className="p-3 grid grid-cols-5 gap-3">
            <Select value={typeFilter} onValueChange={(v) => handleFilterChange(setTypeFilter, v)}>
              <SelectTrigger className="h-10 bg-[var(--card)] border-[var(--card-border)] rounded-xl text-xs sm:text-sm cursor-pointer"><SelectValue placeholder="Semua Jenis" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                <SelectItem value="income">Pemasukan (+)</SelectItem>
                <SelectItem value="expense">Pengeluaran (-)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={(v) => handleFilterChange(setCategoryFilter, v)}>
              <SelectTrigger className="h-10 bg-[var(--card)] border-[var(--card-border)] rounded-xl text-xs sm:text-sm cursor-pointer"><SelectValue placeholder="Semua Kategori" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {Object.entries(CATEGORY_META).map(([key, meta]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2"><span>{meta.emoji}</span><span>{meta.label}</span></span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={bankFilter} onValueChange={(v) => handleFilterChange(setBankFilter, v)}>
              <SelectTrigger className="h-10 bg-[var(--card)] border-[var(--card-border)] rounded-xl text-xs sm:text-sm cursor-pointer"><SelectValue placeholder="Semua Rekening" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Rekening</SelectItem>
                {bankAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <span className="flex items-center gap-2"><span>{account.logo}</span><span>{account.name}</span></span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger className="h-10 bg-[var(--card)] border-[var(--card-border)] rounded-xl text-xs sm:text-sm cursor-pointer"><SelectValue placeholder="Urutan Tanggal" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Terbaru</SelectItem>
                <SelectItem value="date_asc">Terlama</SelectItem>
                <SelectItem value="amount_desc">Nominal Terbesar</SelectItem>
                <SelectItem value="amount_asc">Nominal Terkecil</SelectItem>
              </SelectContent>
            </Select>

            <Button disabled={!hasActiveFilters} onClick={resetAllFilters} variant="ghost" className="h-10 text-rose-500 font-bold text-xs rounded-xl gap-1 hover:bg-rose-500/5 cursor-pointer disabled:opacity-30">
              <FilterX className="h-3.5 w-3.5" /> Reset
            </Button>
          </CardContent>
        </Card>

        {/* Info Filter Aktif */}
        {hasActiveFilters && (
          <div className="flex lg:hidden items-center justify-between text-xs px-1 text-[var(--muted-foreground)] font-medium">
            <span>Ditemukan {filteredAndSorted.length} kecocokan</span>
            <button onClick={resetAllFilters} className="text-rose-500 font-bold flex items-center gap-1"><FilterX className="h-3 w-3" /> Clear</button>
          </div>
        )}

        {/* ── MAIN TRANSACTION LIST (CLEAN CARD DESIGN) ───────── */}
        <div className="min-h-[420px] flex flex-col justify-between">
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {paginatedTransactions.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-24 gap-3 bg-[var(--card)] border border-[var(--card-border)]/50 rounded-2xl text-center px-4">
                  <FilterX className="h-10 w-10 opacity-20 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="font-semibold text-sm text-[var(--foreground)]">Transaksi Tidak Ditemukan</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5 opacity-80">Sesuaikan filter atau ubah kata kunci pencarian Anda.</p>
                  </div>
                </motion.div>
              ) : (
                paginatedTransactions.map((tx, i) => {
                  const catMeta = CATEGORY_META[tx.category as Category] || CATEGORY_META.other;
                  const bank = BANK_MAP[tx.bank_account_id];

                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2, delay: Math.min(i * 0.02, 0.12) }}
                      className="group flex items-center justify-between gap-3 px-4 py-3.5 bg-[var(--card)] border border-[var(--card-border)]/50 sm:hover:border-[var(--card-border)] sm:hover:bg-[var(--muted)]/20 rounded-2xl shadow-sm/5 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {/* Avatar Emoji */}
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base shadow-inner/5 border border-[var(--card-border)]/10"
                          style={{ backgroundColor: `${catMeta.color}15` }}
                        >
                          {catMeta.emoji}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-xs sm:text-sm font-semibold text-[var(--foreground)] leading-tight">
                            {tx.name}
                          </h3>

                          {/* Metadata Badges */}
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-[10px] sm:text-xs text-[var(--muted-foreground)] font-medium">
                            <span className="text-[var(--foreground)] opacity-85">{catMeta.label}</span>
                            <span className="text-[var(--card-border)] sm:inline">&bull;</span>
                            {bank && (
                              <>
                                <span className="flex items-center gap-1 text-[var(--foreground)]/80">
                                  <CreditCard className="h-2.5 w-2.5 opacity-60" />
                                  <span>{bank.name}</span>
                                </span>
                                <span className="text-[var(--card-border)]">&bull;</span>
                              </>
                            )}
                            <span className="opacity-70">{formatDate(tx.date, "dd MMM yyyy")}</span>
                          </div>

                          {tx.notes && (
                            <p className="text-[10px] text-[var(--muted-foreground)] mt-2 bg-[var(--muted)]/40 p-2 rounded-xl border border-[var(--card-border)]/20 italic max-w-full break-words">
                              {tx.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Layout: Amount + Trash Button */}
                      <div className="flex items-center gap-2 shrink-0 pl-1">
                        <span className={cn("text-xs sm:text-sm font-bold tabular-nums", tx.type === "income" ? "text-emerald-500" : "text-rose-500")}>
                          {tx.type === "income" ? "+" : "−"}{formatCurrency(tx.amount, true)}
                        </span>

                        <button
                          onClick={() => handleDelete(tx.id)}
                          disabled={deletingId === tx.id}
                          className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-rose-500 hover:bg-rose-500/10 sm:opacity-0 group-hover:opacity-100 transition-all duration-150 cursor-pointer shrink-0"
                          aria-label="Hapus transaksi"
                        >
                          {deletingId === tx.id ? (
                            <span className="block h-3.5 w-3.5 rounded-full border-2 border-rose-400 border-t-transparent animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* ── PAGINATION CONTROLS ───────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex flex-col xs:flex-row gap-3 items-center justify-between border-t border-[var(--card-border)]/40 pt-5 mt-4">
              <p className="text-[11px] sm:text-xs font-medium text-[var(--muted-foreground)] text-center xs:text-left order-2 xs:order-1">
                Total {filteredAndSorted.length} data &bull; Halaman {page} dari {totalPages}
              </p>
              <div className="flex items-center justify-between xs:justify-end w-full xs:w-auto gap-1.5 order-1 xs:order-2">
                <Button variant="outline" size="icon-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-8 w-8 rounded-xl border-[var(--card-border)]/60 bg-[var(--card)] hover:bg-[var(--muted)] shadow-sm">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-bold px-2 text-[var(--foreground)]">{page} / {totalPages}</span>
                <Button variant="outline" size="icon-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 w-8 rounded-xl border-[var(--card-border)]/60 bg-[var(--card)] hover:bg-[var(--muted)] shadow-sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── NATIVE MOBILE BOTTOM SHEET FILTER DRAWER ─────────── */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <>
            {/* Backdrop Dim overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-black lg:hidden"
            />
            {/* Slide-up Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--card)] border-t border-[var(--card-border)] rounded-t-[2rem] px-5 pt-3 pb-8 max-h-[85vh] overflow-y-auto lg:hidden flex flex-col gap-4 shadow-2xl shadow-black"
            >
              {/* Top Handle Decorator */}
              <div className="h-1 w-12 bg-[var(--card-border)]/60 rounded-full mx-auto mb-2 shrink-0" onClick={() => setIsFilterDrawerOpen(false)} />

              <div className="flex items-center justify-between pb-1">
                <h3 className="text-sm font-bold text-[var(--foreground)]">Filter Transaksi</h3>
                <button onClick={() => setIsFilterDrawerOpen(false)} className="h-7 w-7 rounded-full bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)]"><X className="h-4 w-4" /></button>
              </div>

              <div className="space-y-3.5 flex-1">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Jenis Arus Kas</label>
                  <Select value={typeFilter} onValueChange={(v) => handleFilterChange(setTypeFilter, v)}>
                    <SelectTrigger className="h-11 bg-[var(--muted)]/50 border-transparent rounded-xl text-xs"><SelectValue placeholder="Pilih Jenis" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Semua Jenis</SelectItem><SelectItem value="income">Pemasukan (+)</SelectItem><SelectItem value="expense">Pengeluaran (-)</SelectItem></SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Kategori</label>
                  <Select value={categoryFilter} onValueChange={(v) => handleFilterChange(setCategoryFilter, v)}>
                    <SelectTrigger className="h-11 bg-[var(--muted)]/50 border-transparent rounded-xl text-xs"><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kategori</SelectItem>
                      {Object.entries(CATEGORY_META).map(([key, meta]) => (
                        <SelectItem key={key} value={key}><span className="flex items-center gap-2"><span>{meta.emoji}</span><span>{meta.label}</span></span></SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Rekening Utama</label>
                  <Select value={bankFilter} onValueChange={(v) => handleFilterChange(setBankFilter, v)}>
                    <SelectTrigger className="h-11 bg-[var(--muted)]/50 border-transparent rounded-xl text-xs"><SelectValue placeholder="Pilih Rekening" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Rekening</SelectItem>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}><span className="flex items-center gap-2"><span>{account.logo}</span><span>{account.name}</span></span></SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Urutkan Berdasarkan</label>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                    <SelectTrigger className="h-11 bg-[var(--muted)]/50 border-transparent rounded-xl text-xs"><SelectValue placeholder="Urutan Tanggal" /></SelectTrigger>
                    <SelectContent><SelectItem value="date_desc">Terbaru</SelectItem><SelectItem value="date_asc">Terlama</SelectItem><SelectItem value="amount_desc">Nominal Terbesar</SelectItem><SelectItem value="amount_asc">Nominal Terkecil</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>

              {/* Drawer Bottom Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-1">
                <Button variant="outline" onClick={resetAllFilters} className="h-11 rounded-xl text-xs font-bold gap-1 text-rose-500 hover:bg-rose-500/5 border-[var(--card-border)] cursor-pointer">
                  <FilterX className="h-3.5 w-3.5" /> Clear All
                </Button>
                <Button onClick={() => setIsFilterDrawerOpen(false)} className="h-11 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 cursor-pointer">
                  Terapkan Filter
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}