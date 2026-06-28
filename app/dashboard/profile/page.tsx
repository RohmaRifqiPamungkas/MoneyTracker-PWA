import { createClient } from "@/lib/supabase/server";
import { ProfileClient } from "@/components/dashboard/profile-client";

export const metadata = {
  title: "Profil & Setelan | MoneyTracker",
};

export default async function ProfilePage() {
  const supabase = await createClient();

  // Ambil metadata total jumlah baris dari masing-masing tabel di Supabase
  const [txCount, bankCount, budgetCount] = await Promise.all([
    (supabase as any).from("transactions").select("*", { count: "exact", head: true }),
    (supabase as any).from("bank_accounts").select("*", { count: "exact", head: true }),
    (supabase as any).from("budget_items").select("*", { count: "exact", head: true }),
  ]);

  const stats = {
    transactions: txCount.count ?? 0,
    bankAccounts: bankCount.count ?? 0,
    budgets: budgetCount.count ?? 0,
  };

  return <ProfileClient stats={stats} />;
}
