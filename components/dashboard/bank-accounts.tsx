"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  CheckCircle2,
  Landmark,
  Wallet2,
  Banknote,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BANK_ACCOUNTS, BANK_PRESETS, BANK_TYPE_META } from "@/lib/mock-data";
import { formatCurrency, cn } from "@/lib/utils";
import type { BankAccount, BankAccountType } from "@/lib/types";

/* ── Add-account schema ────────────────────────────────── */
const addSchema = z.object({
  presetId: z.string().min(1, "Pilih jenis rekening"),
  nickname: z.string().min(2, "Nama min. 2 karakter").max(30),
  accountNumber: z.string().max(20).optional(),
  initialBalance: z.number().min(0, "Saldo tidak boleh negatif"),
});
type AddFormValues = z.infer<typeof addSchema>;

/* ── Type icon helper ──────────────────────────────────── */
function TypeIcon({ type, size = 14 }: { type: BankAccountType; size?: number }) {
  const cls = `shrink-0`;
  if (type === "bank")    return <Landmark   className={cls} style={{ width: size, height: size }} />;
  if (type === "ewallet") return <Wallet2    className={cls} style={{ width: size, height: size }} />;
  return                         <Banknote   className={cls} style={{ width: size, height: size }} />;
}

/* ── Single account card ───────────────────────────────── */
function AccountCard({ account, hidden }: { account: BankAccount; hidden: boolean }) {
  const typeMeta = BANK_TYPE_META[account.type];
  return (
    <div
      className="relative shrink-0 w-52 h-[130px] rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        background: `linear-gradient(135deg, ${account.gradient[0]}, ${account.gradient[1]})`,
      }}
    >
      {/* Shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent pointer-events-none" />

      {/* Circle watermark */}
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-20"
        style={{ backgroundColor: "white" }}
      />
      <div
        className="absolute -right-2 top-8 h-16 w-16 rounded-full opacity-10"
        style={{ backgroundColor: "white" }}
      />

      <div className="relative h-full p-4 flex flex-col justify-between">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium text-white/70 leading-none">{account.bankName}</p>
            <p className="text-sm font-semibold text-white mt-0.5 leading-tight">{account.name}</p>
          </div>
          <span className="text-xl leading-none">{account.logo}</span>
        </div>

        {/* Bottom row */}
        <div>
          <p className="text-[10px] text-white/60 mb-1 flex items-center gap-1">
            <TypeIcon type={account.type} size={10} />
            {typeMeta.label}
            {account.accountNumber && (
              <span className="ml-1">•••• {account.accountNumber}</span>
            )}
          </p>
          <p className="text-base font-bold text-white tracking-tight">
            {hidden ? "Rp ••••••" : formatCurrency(account.balance, true)}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Add-account dialog ────────────────────────────────── */
function AddAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [rawBalance, setRawBalance] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddFormValues>({
    resolver: zodResolver(addSchema),
    defaultValues: { initialBalance: 0 },
  });

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setRawBalance(raw);
    setValue("initialBalance", Number(raw), { shouldValidate: !!raw });
  };

  const onSubmit = async (_data: AddFormValues) => {
    await new Promise((r) => setTimeout(r, 800));
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      reset({ initialBalance: 0 });
      setRawBalance("");
      setSelectedPreset("");
      onOpenChange(false);
    }, 1800);
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      reset({ initialBalance: 0 });
      setRawBalance("");
      setSelectedPreset("");
      setIsSuccess(false);
    }
    onOpenChange(v);
  };

  const bankPresets = BANK_PRESETS.filter((p) => p.type === "bank");
  const ewalletPresets = BANK_PRESETS.filter((p) => p.type === "ewallet");
  const cashPresets = BANK_PRESETS.filter((p) => p.type === "cash");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent showHandle>
        <DialogHeader className="pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <Landmark className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <DialogTitle>Tambah Rekening</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                Tambahkan bank atau e-wallet kamu
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="ok"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-10 gap-3"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <p className="font-semibold text-[var(--foreground)]">Rekening Ditambahkan!</p>
                <p className="text-sm text-[var(--muted-foreground)]">Rekening baru berhasil disimpan.</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {/* Preset grid */}
                <Controller
                  name="presetId"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-3">
                      {/* Banks */}
                      <div>
                        <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
                          🏦 Bank
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {bankPresets.map((p) => (
                            <PresetButton
                              key={p.id}
                              preset={p}
                              selected={field.value === p.id}
                              onSelect={() => {
                                field.onChange(p.id);
                                setSelectedPreset(p.id);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      {/* E-wallets */}
                      <div>
                        <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
                          💳 E-Wallet
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {ewalletPresets.map((p) => (
                            <PresetButton
                              key={p.id}
                              preset={p}
                              selected={field.value === p.id}
                              onSelect={() => {
                                field.onChange(p.id);
                                setSelectedPreset(p.id);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      {/* Cash */}
                      <div>
                        <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
                          💵 Lainnya
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {cashPresets.map((p) => (
                            <PresetButton
                              key={p.id}
                              preset={p}
                              selected={field.value === p.id}
                              onSelect={() => {
                                field.onChange(p.id);
                                setSelectedPreset(p.id);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                />
                {errors.presetId && (
                  <p className="text-xs text-rose-500 -mt-3">{errors.presetId.message}</p>
                )}

                {/* Nickname */}
                <div className="space-y-1.5">
                  <Label htmlFor="acc-nick" className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                    Nama Rekening
                  </Label>
                  <Input
                    id="acc-nick"
                    placeholder="Mis. BCA Tabungan, GoPay Utama…"
                    className="h-11 rounded-xl"
                    {...register("nickname")}
                  />
                  {errors.nickname && (
                    <p className="text-xs text-rose-500">{errors.nickname.message}</p>
                  )}
                </div>

                {/* Account number (optional, bank only) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="acc-num" className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                      No. Rekening <span className="normal-case font-normal">(opsional)</span>
                    </Label>
                    <Input
                      id="acc-num"
                      placeholder="4 digit terakhir"
                      maxLength={20}
                      className="h-11 rounded-xl"
                      {...register("accountNumber")}
                    />
                  </div>

                  {/* Initial balance */}
                  <div className="space-y-1.5">
                    <Label htmlFor="acc-bal" className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                      Saldo Awal
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[var(--muted-foreground)]">
                        Rp
                      </span>
                      <Input
                        id="acc-bal"
                        inputMode="numeric"
                        placeholder="0"
                        value={rawBalance ? Number(rawBalance).toLocaleString("id-ID") : ""}
                        onChange={handleBalanceChange}
                        className="h-11 pl-9 text-right font-semibold rounded-xl"
                      />
                    </div>
                    {errors.initialBalance && (
                      <p className="text-xs text-rose-500">{errors.initialBalance.message}</p>
                    )}
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full rounded-xl">
                  <Plus className="h-4 w-4" />
                  Tambah Rekening
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PresetButton({
  preset,
  selected,
  onSelect,
}: {
  preset: (typeof BANK_PRESETS)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 text-center transition-all duration-150",
        selected
          ? "border-emerald-500 bg-emerald-500/8"
          : "border-[var(--card-border)] hover:border-[var(--muted-foreground)]/40 bg-[var(--muted)]/40"
      )}
    >
      <span className="text-lg leading-none">{preset.logo}</span>
      <span
        className={cn(
          "text-[9px] font-semibold leading-tight",
          selected ? "text-emerald-600" : "text-[var(--muted-foreground)]"
        )}
      >
        {preset.name}
      </span>
    </button>
  );
}

/* ── Main widget ───────────────────────────────────────── */
export function BankAccountsWidget() {
  const [addOpen, setAddOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  const totalBalance = BANK_ACCOUNTS.reduce((s, a) => s + a.balance, 0);
  const bankCount    = BANK_ACCOUNTS.filter((a) => a.type === "bank").length;
  const ewalletCount = BANK_ACCOUNTS.filter((a) => a.type === "ewallet").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Landmark className="h-4 w-4 text-blue-500" />
                Rekening & Dompet
              </CardTitle>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                {bankCount} bank · {ewalletCount} e-wallet · {BANK_ACCOUNTS.filter(a => a.type === "cash").length} tunai
              </p>
            </div>
            <button
              onClick={() => setHidden((h) => !h)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              aria-label={hidden ? "Tampilkan saldo" : "Sembunyikan saldo"}
            >
              {hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>

          {/* Total balance */}
          <div className="mt-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-4">
            <p className="text-xs font-medium text-emerald-100/80">Total Semua Rekening</p>
            <p className="text-2xl font-bold text-white mt-0.5">
              {hidden ? "Rp ••••••••" : formatCurrency(totalBalance)}
            </p>
            <div className="mt-2 flex gap-3 text-xs text-emerald-100/70">
              <span>{bankCount} Bank</span>
              <span>·</span>
              <span>{ewalletCount} E-Wallet</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Horizontal scroll carousel */}
          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-thin snap-x snap-mandatory">
            {BANK_ACCOUNTS.map((account, i) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className="snap-start"
              >
                <AccountCard account={account} hidden={hidden} />
              </motion.div>
            ))}

            {/* Add account card */}
            <button
              onClick={() => setAddOpen(true)}
              className="snap-start shrink-0 w-32 h-[130px] rounded-2xl border-2 border-dashed border-[var(--card-border)] flex flex-col items-center justify-center gap-2 text-[var(--muted-foreground)] hover:border-emerald-500/50 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all duration-200"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--muted)]">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-center px-2 leading-tight">Tambah Rekening</span>
            </button>
          </div>

          {/* Account list */}
          <div className="hidden md:block mt-4 space-y-1">
            {BANK_ACCOUNTS.map((account) => {
              const typeMeta = BANK_TYPE_META[account.type];
              const pct = Math.round((account.balance / totalBalance) * 100);
              return (
                <div
                  key={account.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[var(--muted)] transition-colors cursor-default group"
                >
                  {/* Logo bubble */}
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base"
                    style={{
                      background: `linear-gradient(135deg, ${account.gradient[0]}22, ${account.gradient[1]}11)`,
                    }}
                  >
                    {account.logo}
                  </div>

                  {/* Name + number */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{account.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-4 gap-1"
                        style={{ color: typeMeta.color }}
                      >
                        <TypeIcon type={account.type} size={9} />
                        {typeMeta.label}
                      </Badge>
                      {account.accountNumber && (
                        <span className="text-[10px] text-[var(--muted-foreground)]">
                          •••• {account.accountNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Balance + share */}
                  <div className="flex flex-col items-end shrink-0">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      {hidden ? "••••" : formatCurrency(account.balance, true)}
                    </p>
                    <p className="text-[10px] text-[var(--muted-foreground)]">{pct}% total</p>
                  </div>

                  <ChevronRight className="h-3.5 w-3.5 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <AddAccountDialog open={addOpen} onOpenChange={setAddOpen} />
    </motion.div>
  );
}
