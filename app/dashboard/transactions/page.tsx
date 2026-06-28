import { getTransactions, getBankAccounts } from "@/lib/supabase/queries";
import { TransactionsClient } from "@/components/dashboard/transactions-client";

export const metadata = {
  title: "Riwayat Transaksi | MoneyTracker",
};

export default async function TransactionsPage() {
  // Ambil transaksi lebih banyak (misal: 250 transaksi terakhir) untuk halaman riwayat
  const [transactions, bankAccounts] = await Promise.all([
    getTransactions(250),
    getBankAccounts(),
  ]);

  return (
    <TransactionsClient
      initialTransactions={transactions}
      bankAccounts={bankAccounts}
    />
  );
}
