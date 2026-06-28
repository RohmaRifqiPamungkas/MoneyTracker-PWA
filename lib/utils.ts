import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, compact = false): string {
  if (compact && amount >= 1_000_000) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 1,
      notation: "compact",
    }).format(amount);
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string, fmt = "dd MMM yyyy"): string {
  try {
    return format(parseISO(dateStr), fmt, { locale: id });
  } catch {
    return dateStr;
  }
}

export function daysUntil(dateStr: string): number {
  try {
    const target = parseISO(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return differenceInDays(target, today);
  } catch {
    return 0;
  }
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 18) return "Selamat Sore";
  return "Selamat Malam";
}

export function getTrendColor(value: number): string {
  if (value > 0) return "text-emerald-500";
  if (value < 0) return "text-rose-500";
  return "text-slate-400";
}

export function getTrendBg(value: number): string {
  if (value > 0) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  if (value < 0) return "bg-rose-500/10 text-rose-600 dark:text-rose-400";
  return "bg-slate-500/10 text-slate-600 dark:text-slate-400";
}
