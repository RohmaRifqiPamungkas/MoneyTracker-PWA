"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ── Transaction Actions ──────────────────────────────────────────────────────

export async function addTransaction(values: {
  name: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  notes?: string;
  bank_account_id: string;
}) {
  const supabase = await createClient();

  // 1. Insert transaksi
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("transactions")
    .insert({
      id: crypto.randomUUID(),
      name: values.name,
      amount: values.amount,
      type: values.type,
      category: values.category,
      date: values.date,
      notes: values.notes || null,
      bank_account_id: values.bank_account_id,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  // 2. Update saldo rekening otomatis
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: account } = await (supabase as any)
    .from("bank_accounts")
    .select("balance")
    .eq("id", values.bank_account_id)
    .single();

  if (account) {
    const newBalance =
      values.type === "income"
        ? account.balance + values.amount
        : account.balance - values.amount;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("bank_accounts")
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq("id", values.bank_account_id);
  }

  // 3. Update budget spent jika expense
  if (values.type === "expense") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: budget } = await (supabase as any)
      .from("budget_items")
      .select("id, spent")
      .eq("category", values.category)
      .single();

    if (budget) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("budget_items")
        .update({ spent: budget.spent + values.amount })
        .eq("id", budget.id);
    }
  }

  // 4. Revalidate dashboard agar data segar
  revalidatePath("/dashboard");

  return { success: true, data };
}

// ── Bank Account Actions ────────────────────────────────────────────────────

export async function addBankAccount(values: {
  name: string;
  bank_name: string;
  type: "bank" | "ewallet" | "cash";
  account_number?: string;
  balance: number;
  color: string;
  logo: string;
  gradient: string[];
}) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("bank_accounts")
    .insert({
      id: crypto.randomUUID(),
      name: values.name,
      bank_name: values.bank_name,
      type: values.type,
      account_number: values.account_number || null,
      balance: values.balance,
      color: values.color,
      logo: values.logo,
      gradient: values.gradient,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true, data };
}

// ── Delete Transaction ──────────────────────────────────────────────────────

export async function removeTransaction(id: string) {
  const supabase = await createClient();

  // Ambil data transaksi dulu untuk rollback saldo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tx } = await (supabase as any)
    .from("transactions")
    .select("amount, type, bank_account_id, category")
    .eq("id", id)
    .single();

  if (tx) {
    // Rollback saldo rekening
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: account } = await (supabase as any)
      .from("bank_accounts")
      .select("balance")
      .eq("id", tx.bank_account_id)
      .single();

    if (account) {
      const newBalance =
        tx.type === "income"
          ? account.balance - tx.amount
          : account.balance + tx.amount;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("bank_accounts")
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq("id", tx.bank_account_id);
    }

    // Rollback budget spent jika expense
    if (tx.type === "expense") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: budget } = await (supabase as any)
        .from("budget_items")
        .select("id, spent")
        .eq("category", tx.category)
        .single();

      if (budget) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("budget_items")
          .update({ spent: Math.max(0, budget.spent - tx.amount) })
          .eq("id", budget.id);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("transactions")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
