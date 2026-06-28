import { getBudgetItems } from "@/lib/supabase/queries";
import { BudgetClient } from "@/components/dashboard/budget-client";

export const metadata = {
  title: "Anggaran Bulanan | MoneyTracker",
};

export default async function BudgetPage() {
  const budgetItems = await getBudgetItems();

  return <BudgetClient initialBudgets={budgetItems} />;
}
