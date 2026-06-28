"use client";

import { useState } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TransactionDialog } from "@/components/layout/transaction-dialog";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      {/* Page content – extra bottom padding so bottom nav doesn't obscure content */}
      <div className="pb-28 lg:pb-0">{children}</div>

      {/* Bottom nav (hidden on lg+) */}
      <BottomNav onAddClick={() => setDialogOpen(true)} />

      {/* Transaction modal */}
      <TransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
