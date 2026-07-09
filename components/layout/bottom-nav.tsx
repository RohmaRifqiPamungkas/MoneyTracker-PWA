"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ClockArrowUp,
  Plus,
  Target,
  UserCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Beranda",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Riwayat",
    href: "/dashboard/transactions",
    icon: <ClockArrowUp className="h-5 w-5" />,
  },
];

const NAV_ITEMS_RIGHT: NavItem[] = [
  {
    label: "Anggaran",
    href: "/dashboard/budget",
    icon: <Target className="h-5 w-5" />,
  },
  {
    label: "Akun",
    href: "/dashboard/profile",
    icon: <UserCircle2 className="h-5 w-5" />,
  },
];

interface BottomNavProps {
  onAddClick: () => void;
}

export function BottomNav({ onAddClick }: BottomNavProps) {
  const pathname = usePathname();

  const handleAddClick = () => {
    if (typeof window !== "undefined" && window.navigator?.vibrate) {
      window.navigator.vibrate(50);
    }
    onAddClick();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      {/* Glass bar */}
      <div className="mx-3 mb-3 rounded-3xl border border-[var(--card-border)] bg-[var(--card)]/90 backdrop-blur-xl shadow-lg shadow-black/10">
        <nav className="flex items-center h-16 px-2" aria-label="Main navigation">

          {/* Left items */}
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <NavTab key={item.href} item={item} isActive={isActive} />
            );
          })}

          {/* FAB – center */}
          <div className="flex flex-1 items-center justify-center">
            <button
              onClick={handleAddClick}
              aria-label="Tambah transaksi"
              className="group relative flex h-14 w-14 items-center justify-center"
            >
              {/* Glow ring */}
              <span className="absolute inset-0 rounded-full bg-emerald-500/20 scale-0 group-hover:scale-100 group-active:scale-95 transition-transform duration-200" />
              {/* Button body */}
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md shadow-emerald-500/30 transition-transform duration-150 group-active:scale-95">
                <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
              </span>
            </button>
          </div>

          {/* Right items */}
          {NAV_ITEMS_RIGHT.map((item) => {
            const isActive = pathname === item.href;
            return (
              <NavTab key={item.href} item={item} isActive={isActive} />
            );
          })}
        </nav>
      </div>

      {/* iOS home-bar safe area spacer */}
      <div className="h-safe-b" style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
    </div>
  );
}

function NavTab({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className="flex flex-1 flex-col items-center justify-center gap-1 py-2 rounded-xl transition-colors group"
      aria-current={isActive ? "page" : undefined}
    >
      <span
        className={cn(
          "relative flex items-center justify-center transition-colors duration-150",
          isActive
            ? "text-emerald-500"
            : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]"
        )}
      >
        {item.icon}
        {/* Active dot */}
        {isActive && (
          <motion.span
            layoutId="nav-active-dot"
            className="absolute -bottom-1.5 h-1 w-1 rounded-full bg-emerald-500"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
      </span>
      <span
        className={cn(
          "text-[10px] font-medium leading-none transition-colors duration-150",
          isActive
            ? "text-emerald-500"
            : "text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]"
        )}
      >
        {item.label}
      </span>
    </Link>
  );
}
