import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { FINANCIAL_INSIGHTS } from "@/lib/mock-data";
import {
  getTransactions,
  getBankAccounts,
  getBudgetItems,
  getSavingsGoals,
  getUpcomingBills,
  getFinancialSummary,
  getMonthlyData,
  getCategoryExpenses,
} from "@/lib/supabase/queries";

export const metadata = {
  title: "Dashboard | MoneyTracker",
};

export default async function DashboardPage() {
  // Ambil semua data dari Supabase secara paralel (Super Cepat!)
  const [
    transactions,
    bankAccounts,
    budgetItems,
    savingsGoals,
    upcomingBills,
    summary,
    monthlyData,
    categoryExpenses,
  ] = await Promise.all([
    getTransactions(),
    getBankAccounts(),
    getBudgetItems(),
    getSavingsGoals(),
    getUpcomingBills(),
    getFinancialSummary(),
    getMonthlyData(),
    getCategoryExpenses(),
  ]);

  // Pass data ke client wrapper untuk dirender dengan interaktivitas
  return (
    <DashboardClient
      summary={summary}
      monthlyData={monthlyData}
      categoryExpenses={categoryExpenses}
      insights={FINANCIAL_INSIGHTS} // Masih mock karena butuh AI/Logic khusus untuk generate insights
      transactions={transactions}
      bankAccounts={bankAccounts}
      budgetItems={budgetItems}
      savingsGoals={savingsGoals}
      upcomingBills={upcomingBills}
    />
  );
}
