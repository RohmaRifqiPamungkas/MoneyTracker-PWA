"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Inbox, TrendingUp, TrendingDown, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RECENT_TRANSACTIONS, CATEGORY_META, BANK_ACCOUNTS } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { TransactionType } from "@/lib/types";

const PAGE_SIZE = 6;

const BANK_MAP = Object.fromEntries(BANK_ACCOUNTS.map((b) => [b.id, b]));

export function RecentTransactions() {
  const [search, setSearch]     = useState("");
  const [typeFilter, setFilter] = useState<"all" | TransactionType>("all");
  const [page, setPage]         = useState(1);

  const filtered = useMemo(() => {
    return RECENT_TRANSACTIONS.filter((tx) => {
      const matchSearch =
        tx.name.toLowerCase().includes(search.toLowerCase()) ||
        CATEGORY_META[tx.category]?.label.toLowerCase().includes(search.toLowerCase()) ||
        BANK_MAP[tx.bankAccountId]?.name.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "all" || tx.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [search, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (v: string) => { setSearch(v); setPage(1); };
  const handleFilter = (v: string) => { setFilter(v as "all" | TransactionType); setPage(1); };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-base shrink-0">Transaksi Terbaru</CardTitle>

            {/* Inline filter row — search stretches, type filter fixed */}
            <div className="flex items-center gap-2 flex-1 max-w-xs ml-auto">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
                <Input
                  placeholder="Cari…"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8 h-8 text-xs w-full bg-[var(--muted)]/50 border-transparent focus:border-[var(--ring)] rounded-lg"
                />
              </div>
              <Select value={typeFilter} onValueChange={handleFilter}>
                <SelectTrigger className="h-8 w-[110px] text-xs shrink-0 bg-[var(--muted)]/50 border-transparent rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="flex items-center gap-1.5"><ArrowUpDown className="h-3 w-3" /> Semua</span>
                  </SelectItem>
                  <SelectItem value="income">
                    <span className="flex items-center gap-1.5"><TrendingUp className="h-3 w-3 text-emerald-500" /> Masuk</span>
                  </SelectItem>
                  <SelectItem value="expense">
                    <span className="flex items-center gap-1.5"><TrendingDown className="h-3 w-3 text-rose-500" /> Keluar</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 px-3 pb-3">
          <div className="min-h-[272px]">
            <AnimatePresence mode="popLayout">
              {paginated.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-14 gap-3 text-[var(--muted-foreground)]"
                >
                  <Inbox className="h-10 w-10 opacity-30" />
                  <p className="text-sm">Tidak ada transaksi ditemukan</p>
                </motion.div>
              ) : (
                paginated.map((tx, i) => {
                  const catMeta = CATEGORY_META[tx.category];
                  const bank    = BANK_MAP[tx.bankAccountId];

                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.2, delay: i * 0.035 }}
                      className="flex items-center gap-3 rounded-xl px-2.5 py-2 hover:bg-[var(--muted)]/60 transition-colors cursor-default"
                    >
                      {/* Category icon */}
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base"
                        style={{ backgroundColor: `${catMeta?.color ?? "#6366f1"}18` }}
                      >
                        {catMeta?.emoji ?? "💳"}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[var(--foreground)] leading-tight">
                          {tx.name}
                        </p>
                        <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 truncate leading-tight">
                          {catMeta?.label}{bank ? ` · ${bank.name}` : ""} · {formatDate(tx.date, "dd MMM")}
                        </p>
                      </div>

                      {/* Amount */}
                      <span
                        className={`text-sm font-semibold shrink-0 tabular-nums ${
                          tx.type === "income" ? "text-emerald-500" : "text-rose-500"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "−"}
                        {formatCurrency(tx.amount, true)}
                      </span>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-2 flex items-center justify-between border-t border-[var(--card-border)] pt-2.5">
              <p className="text-[11px] text-[var(--muted-foreground)]">
                {filtered.length} transaksi &middot; Hal. {page}/{totalPages}
              </p>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => setPage((p) => Math.max(1, p - 1))}        disabled={page === 1}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
