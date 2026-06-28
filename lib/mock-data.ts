import type {
  Transaction,
  MonthlyData,
  CategoryExpense,
  BudgetItem,
  Insight,
  SavingsGoal,
  UpcomingBill,
  FinancialSummary,
  BankAccount,
  BankPreset,
} from "./types";

/* ── Bank accounts ─────────────────────────────────────── */
export const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: "bca-1",
    name: "BCA Xpresi",
    bankName: "Bank Central Asia",
    type: "bank",
    accountNumber: "5628",
    balance: 28_750_000,
    color: "#0066B3",
    logo: "🏦",
    gradient: ["#0066B3", "#004A82"],
  },
  {
    id: "mandiri-1",
    name: "Mandiri Everyday",
    bankName: "Bank Mandiri",
    type: "bank",
    accountNumber: "9142",
    balance: 12_500_000,
    color: "#1E3A5F",
    logo: "🏛️",
    gradient: ["#1E3A5F", "#D4A017"],
  },
  {
    id: "gopay-1",
    name: "GoPay",
    bankName: "GoPay by GoTo",
    type: "ewallet",
    balance: 1_250_000,
    color: "#00AA13",
    logo: "💚",
    gradient: ["#00AA13", "#007D0E"],
  },
  {
    id: "ovo-1",
    name: "OVO",
    bankName: "OVO",
    type: "ewallet",
    balance: 850_000,
    color: "#4B1C8D",
    logo: "💜",
    gradient: ["#4B1C8D", "#320D60"],
  },
  {
    id: "dana-1",
    name: "DANA",
    bankName: "DANA Indonesia",
    type: "ewallet",
    balance: 500_000,
    color: "#108EE9",
    logo: "💙",
    gradient: ["#108EE9", "#0E7AC9"],
  },
  {
    id: "cash-1",
    name: "Uang Tunai",
    bankName: "Tunai",
    type: "cash",
    balance: 2_000_000,
    color: "#10b981",
    logo: "💵",
    gradient: ["#10b981", "#059669"],
  },
];

/* ── Bank presets for add-account form ─────────────────── */
export const BANK_PRESETS: BankPreset[] = [
  { id: "bca",      name: "BCA",       fullName: "Bank Central Asia",       type: "bank",    color: "#0066B3", logo: "🏦", gradient: ["#0066B3", "#004A82"] },
  { id: "mandiri",  name: "Mandiri",   fullName: "Bank Mandiri",            type: "bank",    color: "#1E3A5F", logo: "🏛️", gradient: ["#1E3A5F", "#D4A017"] },
  { id: "bri",      name: "BRI",       fullName: "Bank Rakyat Indonesia",   type: "bank",    color: "#005BAC", logo: "🏦", gradient: ["#005BAC", "#003F7A"] },
  { id: "bni",      name: "BNI",       fullName: "Bank Negara Indonesia",   type: "bank",    color: "#FF6600", logo: "🏦", gradient: ["#FF6600", "#CC5200"] },
  { id: "cimb",     name: "CIMB",      fullName: "CIMB Niaga",              type: "bank",    color: "#C8102E", logo: "🏦", gradient: ["#C8102E", "#960C22"] },
  { id: "jago",     name: "Jago",      fullName: "Bank Jago",               type: "bank",    color: "#00C853", logo: "🐆", gradient: ["#00C853", "#009E40"] },
  { id: "seabank",  name: "SeaBank",   fullName: "Sea Bank Indonesia",      type: "bank",    color: "#FF5722", logo: "🌊", gradient: ["#FF5722", "#CC4419"] },
  { id: "allo",     name: "Allo Bank", fullName: "Allo Bank",               type: "bank",    color: "#7B2D8B", logo: "🏦", gradient: ["#7B2D8B", "#5B1F68"] },
  { id: "gopay",    name: "GoPay",     fullName: "GoPay by GoTo",           type: "ewallet", color: "#00AA13", logo: "💚", gradient: ["#00AA13", "#007D0E"] },
  { id: "ovo",      name: "OVO",       fullName: "OVO",                     type: "ewallet", color: "#4B1C8D", logo: "💜", gradient: ["#4B1C8D", "#320D60"] },
  { id: "dana",     name: "DANA",      fullName: "DANA Indonesia",          type: "ewallet", color: "#108EE9", logo: "💙", gradient: ["#108EE9", "#0E7AC9"] },
  { id: "shopee",   name: "ShopeePay", fullName: "ShopeePay",               type: "ewallet", color: "#EE4D2D", logo: "🧡", gradient: ["#EE4D2D", "#CC3D20"] },
  { id: "linkaja",  name: "LinkAja",   fullName: "LinkAja",                 type: "ewallet", color: "#E3000F", logo: "❤️", gradient: ["#E3000F", "#B5000C"] },
  { id: "cash",     name: "Tunai",     fullName: "Uang Tunai",              type: "cash",    color: "#10b981", logo: "💵", gradient: ["#10b981", "#059669"] },
];

/* ── Financial summary ─────────────────────────────────── */
export const FINANCIAL_SUMMARY: FinancialSummary = {
  totalBalance: 48_750_000,
  totalIncome: 18_500_000,
  totalExpenses: 11_200_000,
  totalSavings: 7_300_000,
  balanceGrowth: 12.4,
  incomeGrowth: 8.2,
  expenseGrowth: -3.5,
  savingsRate: 39.5,
};

export const MONTHLY_DATA: MonthlyData[] = [
  { month: "Jan", income: 15_000_000, expense: 10_200_000 },
  { month: "Feb", income: 15_500_000, expense: 9_800_000 },
  { month: "Mar", income: 16_200_000, expense: 11_500_000 },
  { month: "Apr", income: 16_800_000, expense: 10_900_000 },
  { month: "Mei", income: 17_200_000, expense: 12_100_000 },
  { month: "Jun", income: 18_000_000, expense: 11_400_000 },
  { month: "Jul", income: 17_500_000, expense: 10_800_000 },
  { month: "Agu", income: 18_500_000, expense: 11_900_000 },
  { month: "Sep", income: 19_200_000, expense: 12_300_000 },
  { month: "Okt", income: 18_800_000, expense: 11_600_000 },
  { month: "Nov", income: 19_500_000, expense: 12_800_000 },
  { month: "Des", income: 18_500_000, expense: 11_200_000 },
];

export const CATEGORY_EXPENSES: CategoryExpense[] = [
  { category: "food",          label: "Makanan",      amount: 3_200_000, percentage: 28.6, color: "#10b981" },
  { category: "transport",     label: "Transportasi", amount: 1_800_000, percentage: 16.1, color: "#6366f1" },
  { category: "shopping",      label: "Belanja",      amount: 2_100_000, percentage: 18.7, color: "#f59e0b" },
  { category: "bills",         label: "Tagihan",      amount: 1_500_000, percentage: 13.4, color: "#3b82f6" },
  { category: "entertainment", label: "Hiburan",      amount: 1_200_000, percentage: 10.7, color: "#ec4899" },
  { category: "health",        label: "Kesehatan",    amount: 1_400_000, percentage: 12.5, color: "#14b8a6" },
];

export const BUDGET_ITEMS: BudgetItem[] = [
  { category: "food",          label: "Makanan",      spent: 2_500_000, limit: 3_000_000, color: "#10b981" },
  { category: "transport",     label: "Transportasi", spent: 800_000,   limit: 1_500_000, color: "#6366f1" },
  { category: "shopping",      label: "Belanja",      spent: 1_200_000, limit: 2_000_000, color: "#f59e0b" },
  { category: "bills",         label: "Tagihan",      spent: 1_500_000, limit: 1_500_000, color: "#3b82f6" },
  { category: "entertainment", label: "Hiburan",      spent: 900_000,   limit: 1_000_000, color: "#ec4899" },
  { category: "health",        label: "Kesehatan",    spent: 300_000,   limit: 1_000_000, color: "#14b8a6" },
];

export const RECENT_TRANSACTIONS: Transaction[] = [
  { id: "1",  name: "Gaji Bulanan",         amount: 15_000_000, type: "income",  category: "salary",        date: "2026-06-20", notes: "Gaji bulan Juni",         bankAccountId: "bca-1"     },
  { id: "2",  name: "Freelance Design",     amount: 3_500_000,  type: "income",  category: "freelance",     date: "2026-06-18",                                    bankAccountId: "bca-1"     },
  { id: "3",  name: "Groceries Superindo",  amount: 450_000,    type: "expense", category: "food",          date: "2026-06-18",                                    bankAccountId: "gopay-1"   },
  { id: "4",  name: "Tokopedia - Baju",     amount: 320_000,    type: "expense", category: "shopping",      date: "2026-06-17",                                    bankAccountId: "gopay-1"   },
  { id: "5",  name: "Grab - Ojek Online",   amount: 45_000,     type: "expense", category: "transport",     date: "2026-06-17",                                    bankAccountId: "ovo-1"     },
  { id: "6",  name: "Netflix",              amount: 54_000,     type: "expense", category: "entertainment",  date: "2026-06-16",                                    bankAccountId: "bca-1"     },
  { id: "7",  name: "Apotik Kimia Farma",  amount: 125_000,    type: "expense", category: "health",        date: "2026-06-15",                                    bankAccountId: "dana-1"    },
  { id: "8",  name: "PLN Token Listrik",    amount: 250_000,    type: "expense", category: "bills",         date: "2026-06-15",                                    bankAccountId: "gopay-1"   },
  { id: "9",  name: "Makan Siang – Warteg", amount: 25_000,     type: "expense", category: "food",          date: "2026-06-14",                                    bankAccountId: "cash-1"    },
  { id: "10", name: "Dividen Saham",        amount: 750_000,    type: "income",  category: "investment",    date: "2026-06-13",                                    bankAccountId: "mandiri-1" },
  { id: "11", name: "Indomaret",            amount: 87_500,     type: "expense", category: "food",          date: "2026-06-13",                                    bankAccountId: "ovo-1"     },
  { id: "12", name: "Top Up GoPay",         amount: 500_000,    type: "income",  category: "other",         date: "2026-06-12",                                    bankAccountId: "bca-1"     },
];

export const FINANCIAL_INSIGHTS: Insight[] = [
  { id: "1", type: "warning", message: "Pengeluaran makanan naik 15% dibanding bulan lalu. Pertimbangkan memasak di rumah lebih sering.",      icon: "🍽️" },
  { id: "2", type: "success", message: "Kamu berhasil menabung 39.5% dari pemasukan bulan ini. Pertahankan kebiasaan baik ini!",              icon: "🎉" },
  { id: "3", type: "info",    message: "Kategori belanja online menjadi pengeluaran terbesar kedua minggu ini sebesar Rp 1,2 juta.",           icon: "🛍️" },
  { id: "4", type: "tip",     message: "Budget hiburan hampir habis (90%). Pertimbangkan untuk mengurangi langganan streaming.",              icon: "💡" },
];

export const SAVINGS_GOALS: SavingsGoal[] = [
  { id: "1", name: "MacBook Pro M4",       targetAmount: 35_000_000, currentAmount: 18_500_000, targetDate: "2026-12-31", emoji: "💻" },
  { id: "2", name: "Dana Darurat",         targetAmount: 50_000_000, currentAmount: 38_750_000, targetDate: "2026-09-30", emoji: "🛡️" },
  { id: "3", name: "Liburan Bali",         targetAmount: 8_000_000,  currentAmount: 4_200_000,  targetDate: "2026-08-15", emoji: "🏖️" },
  { id: "4", name: "Investasi Reksa Dana", targetAmount: 20_000_000, currentAmount: 12_000_000, targetDate: "2026-12-01", emoji: "📈" },
];

export const UPCOMING_BILLS: UpcomingBill[] = [
  { id: "1", name: "Indihome Internet", amount: 350_000, dueDate: "2026-06-25", category: "bills",         emoji: "🌐" },
  { id: "2", name: "Netflix Premium",   amount: 54_000,  dueDate: "2026-06-28", category: "entertainment", emoji: "🎬" },
  { id: "3", name: "PLN Listrik",       amount: 450_000, dueDate: "2026-07-01", category: "bills",         emoji: "⚡" },
  { id: "4", name: "Kartu Telkomsel",   amount: 100_000, dueDate: "2026-07-05", category: "bills",         emoji: "📱" },
  { id: "5", name: "Spotify Premium",   amount: 54_990,  dueDate: "2026-07-08", category: "entertainment", emoji: "🎵" },
  { id: "6", name: "BPJS Kesehatan",    amount: 150_000, dueDate: "2026-07-10", category: "health",        emoji: "🏥" },
];

export const CATEGORY_META: Record<string, { label: string; emoji: string; color: string }> = {
  food:          { label: "Makanan",      emoji: "🍔", color: "#10b981" },
  transport:     { label: "Transportasi", emoji: "🚗", color: "#6366f1" },
  shopping:      { label: "Belanja",      emoji: "🛍️", color: "#f59e0b" },
  bills:         { label: "Tagihan",      emoji: "📄", color: "#3b82f6" },
  entertainment: { label: "Hiburan",      emoji: "🎮", color: "#ec4899" },
  health:        { label: "Kesehatan",    emoji: "💊", color: "#14b8a6" },
  salary:        { label: "Gaji",         emoji: "💰", color: "#10b981" },
  freelance:     { label: "Freelance",    emoji: "💼", color: "#8b5cf6" },
  investment:    { label: "Investasi",    emoji: "📈", color: "#06b6d4" },
  other:         { label: "Lainnya",      emoji: "📦", color: "#94a3b8" },
};

export const BANK_TYPE_META: Record<string, { label: string; color: string }> = {
  bank:    { label: "Bank",    color: "#3b82f6" },
  ewallet: { label: "E-Wallet", color: "#8b5cf6" },
  cash:    { label: "Tunai",   color: "#10b981" },
};
