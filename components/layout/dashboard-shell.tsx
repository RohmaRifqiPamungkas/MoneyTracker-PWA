"use client";

import { useState } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TransactionDialog } from "@/components/layout/transaction-dialog";
import type { BankAccountRow } from "@/lib/supabase/types";

interface DashboardShellProps {
  children: React.ReactNode;
  bankAccounts: BankAccountRow[];
}

export function DashboardShell({ children, bankAccounts }: DashboardShellProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="pb-28 lg:pb-0">{children}</div>
      <BottomNav onAddClick={() => setDialogOpen(true)} />
      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        bankAccounts={bankAccounts}
      />
    </>
  );
}
