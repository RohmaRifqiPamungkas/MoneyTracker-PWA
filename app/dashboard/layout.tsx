import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createClient } from "@/lib/supabase/server";
import { getAvailableTransactionCategories, getBankAccounts } from "@/lib/supabase/queries";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [bankAccounts, availableCategories] = await Promise.all([
    getBankAccounts(),
    getAvailableTransactionCategories(),
  ]);

  return (
    <DashboardShell bankAccounts={bankAccounts} availableCategories={availableCategories}>
      {children}
    </DashboardShell>
  );
}
