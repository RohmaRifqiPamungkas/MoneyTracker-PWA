/**
 * lib/supabase/queries.ts
 *
 * Semua fungsi fetch data dari Supabase.
 * Gunakan fungsi-fungsi ini di Server Components atau Server Actions
 * untuk menggantikan import dari "@/lib/mock-data".
 *
 * Contoh penggunaan di Server Component:
 *   import { getTransactions } from "@/lib/supabase/queries";
 *   const transactions = await getTransactions();
 *
 * NOTE: Beberapa fungsi mutasi menggunakan `as any` untuk bypass
 * TypeScript inference yang belum sempurna sebelum Supabase CLI
 * men-generate types otomatis dari schema yang sudah dibuat.
 */

import { createClient } from "./server";
import type {
  TransactionRow,
  BankAccountRow,
  BudgetItemRow,
  SavingsGoalRow,
  UpcomingBillRow,
} from "./types";

// ── Transactions ────────────────────────────────────────────────────────────

/**
 * Ambil semua transaksi, diurutkan dari yang terbaru.
 * @param limit - Jumlah maksimal transaksi (default: 50)
 */
export async function getTransactions(limit = 50): Promise<TransactionRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getTransactions]", error.message);
    return [];
  }
  return (data ?? []) as TransactionRow[];
}

/**
 * Tambah transaksi baru.
 */
export async function insertTransaction(values: {
  name: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  notes?: string;
  bank_account_id: string;
}): Promise<TransactionRow> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("transactions")
    .insert({ id: crypto.randomUUID(), ...values })
    .select()
    .single();

  if (error) throw new Error(String(error.message));
  return data as TransactionRow;
}

/**
 * Hapus transaksi berdasarkan id.
 */
export async function deleteTransaction(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Bank Accounts ───────────────────────────────────────────────────────────

/**
 * Ambil semua rekening bank/e-wallet.
 */
export async function getBankAccounts(): Promise<BankAccountRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bank_accounts")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getBankAccounts]", error.message);
    return [];
  }
  return (data ?? []) as BankAccountRow[];
}

/**
 * Update saldo rekening.
 */
export async function updateBankBalance(id: string, balance: number): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("bank_accounts")
    .update({ balance, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(String(error.message));
}

// ── Budget Items ────────────────────────────────────────────────────────────

/**
 * Ambil semua budget kategori bulan ini.
 */
export async function getBudgetItems(): Promise<BudgetItemRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budget_items")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getBudgetItems]", error.message);
    return [];
  }
  return (data ?? []) as BudgetItemRow[];
}

/**
 * Update jumlah yang sudah digunakan (spent) pada sebuah budget item.
 */
export async function updateBudgetSpent(id: string, spent: number): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("budget_items")
    .update({ spent })
    .eq("id", id);
  if (error) throw new Error(String(error.message));
}

// ── Savings Goals ───────────────────────────────────────────────────────────

/**
 * Ambil semua target tabungan.
 */
export async function getSavingsGoals(): Promise<SavingsGoalRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("savings_goals")
    .select("*")
    .order("target_date", { ascending: true });

  if (error) {
    console.error("[getSavingsGoals]", error.message);
    return [];
  }
  return (data ?? []) as SavingsGoalRow[];
}

/**
 * Update jumlah tabungan saat ini pada sebuah target.
 */
export async function updateSavingsGoalAmount(id: string, current_amount: number): Promise<void> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("savings_goals")
    .update({ current_amount, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(String(error.message));
}

// ── Upcoming Bills ──────────────────────────────────────────────────────────

/**
 * Ambil tagihan yang akan datang, diurutkan dari yang paling dekat jatuh tempo.
 */
export async function getUpcomingBills(): Promise<UpcomingBillRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("upcoming_bills")
    .select("*")
    .order("due_date", { ascending: true });

  if (error) {
    console.error("[getUpcomingBills]", error.message);
    return [];
  }
  return (data ?? []) as UpcomingBillRow[];
}

// ── Financial Summary ───────────────────────────────────────────────────────

/**
 * Hitung ringkasan keuangan secara real-time dari data transaksi.
 * Ini menggantikan FINANCIAL_SUMMARY dari mock-data.
 */
export async function getFinancialSummary() {
  const supabase = await createClient();

  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const [txResult, bankResult] = await Promise.all([
    supabase
      .from("transactions")
      .select("amount, type")
      .gte("date", start)
      .lte("date", end),
    supabase.from("bank_accounts").select("balance"),
  ]);

  const transactions = (txResult.data  ?? []) as Pick<TransactionRow, "amount" | "type">[];
  const bankAccounts = (bankResult.data ?? []) as Pick<BankAccountRow, "balance">[];

  const totalBalance  = bankAccounts.reduce((sum, b) => sum + b.balance, 0);
  const totalIncome   = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSavings  = totalIncome - totalExpenses;
  const savingsRate   = totalIncome > 0 ? Math.round((totalSavings / totalIncome) * 100) : 0;

  return {
    totalBalance,
    totalIncome,
    totalExpenses,
    totalSavings,
    savingsRate,
    balanceGrowth: 0,
    incomeGrowth:  0,
    expenseGrowth: 0,
  };
}

// ── Chart Compute ───────────────────────────────────────────────────────────

/**
 * Hitung data pemasukan & pengeluaran per bulan untuk CashflowChart.
 */
export async function getMonthlyData() {
  const supabase = await createClient();
  const { data, error } = (await supabase
    .from("transactions")
    .select("amount, type, date")
    .order("date", { ascending: true })) as { data: { amount: number; type: string; date: string }[] | null, error: any };

  if (error || !data) return [];

  // Group by month (MMM format)
  const monthlyMap = new Map<string, { month: string; income: number; expense: number }>();
  
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  
  data.forEach((tx) => {
    const d = new Date(tx.date);
    const monthStr = monthNames[d.getMonth()];
    
    if (!monthlyMap.has(monthStr)) {
      monthlyMap.set(monthStr, { month: monthStr, income: 0, expense: 0 });
    }
    
    const entry = monthlyMap.get(monthStr)!;
    if (tx.type === "income") entry.income += tx.amount;
    else entry.expense += tx.amount;
  });

  return Array.from(monthlyMap.values());
}

/**
 * Hitung distribusi pengeluaran berdasarkan kategori untuk ExpenseChart.
 */
export async function getCategoryExpenses() {
  const supabase = await createClient();
  
  // Ambil transaksi bulan ini saja untuk kategori
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  const { data, error } = (await supabase
    .from("transactions")
    .select("amount, category")
    .eq("type", "expense")
    .gte("date", start)
    .lte("date", end)) as { data: { amount: number; category: string }[] | null, error: any };

  if (error || !data) return [];

  const CATEGORY_META: Record<string, { label: string; color: string }> = {
    food:          { label: "Makanan",      color: "#10b981" },
    transport:     { label: "Transportasi", color: "#6366f1" },
    shopping:      { label: "Belanja",      color: "#f59e0b" },
    bills:         { label: "Tagihan",      color: "#3b82f6" },
    entertainment: { label: "Hiburan",      color: "#ec4899" },
    health:        { label: "Kesehatan",    color: "#14b8a6" },
    other:         { label: "Lainnya",      color: "#94a3b8" },
  };

  const totalExpense = data.reduce((sum, tx) => sum + tx.amount, 0);
  if (totalExpense === 0) return [];

  const map = new Map<string, number>();
  data.forEach(tx => {
    map.set(tx.category, (map.get(tx.category) || 0) + tx.amount);
  });

  const result = Array.from(map.entries()).map(([category, amount]) => {
    const meta = CATEGORY_META[category] || CATEGORY_META.other;
    return {
      category: category as any,
      label: meta.label,
      amount,
      percentage: Number(((amount / totalExpense) * 100).toFixed(1)),
      color: meta.color,
    };
  });

  return result.sort((a, b) => b.amount - a.amount);
}

